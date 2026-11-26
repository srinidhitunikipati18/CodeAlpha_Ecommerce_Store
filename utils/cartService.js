const { getDb } = require('../database/db');

const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING_FEE = 79;
const TAX_RATE = 0.18;

function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Resolves the cart owner context from the current request.
 */
function getCartContext(req) {
  if (req.user && req.user.id) {
    return { type: 'user', userId: req.user.id };
  }
  return { type: 'session', sessionId: req.sessionID };
}

/**
 * Fetches cart items with product details and computes totals server-side.
 */
function buildCartResponse(ctx) {
  const db = getDb();
  const whereClause =
    ctx.type === 'user'
      ? 'c.user_id = ?'
      : 'c.session_id = ? AND c.user_id IS NULL';
  const param = ctx.type === 'user' ? ctx.userId : ctx.sessionId;

  const rows = db
    .prepare(
      `SELECT
         c.id AS cart_item_id,
         c.product_id,
         c.quantity,
         p.name,
         p.slug,
         p.price,
         p.original_price,
         p.category,
         p.image_url,
         p.stock
       FROM cart_items c
       INNER JOIN products p ON p.id = c.product_id
       WHERE ${whereClause}
       ORDER BY c.created_at ASC`
    )
    .all(param);

  let subtotal = 0;
  let itemCount = 0;

  const items = rows.map((row) => {
    const lineTotal = roundCurrency(row.price * row.quantity);
    subtotal += lineTotal;
    itemCount += row.quantity;
    return {
      cartItemId: row.cart_item_id,
      productId: row.product_id,
      name: row.name,
      slug: row.slug,
      price: row.price,
      originalPrice: row.original_price,
      category: row.category,
      imageUrl: row.image_url,
      stock: row.stock,
      quantity: row.quantity,
      lineTotal,
      exceedsStock: row.quantity > row.stock
    };
  });

  subtotal = roundCurrency(subtotal);
  const shippingFee =
    items.length === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const taxAmount = items.length === 0 ? 0 : roundCurrency(subtotal * TAX_RATE);
  const totalAmount = roundCurrency(subtotal + shippingFee + taxAmount);

  return {
    items,
    summary: {
      itemCount,
      subtotal,
      shippingFee,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      amountToFreeShipping:
        subtotal >= FREE_SHIPPING_THRESHOLD || items.length === 0
          ? 0
          : roundCurrency(FREE_SHIPPING_THRESHOLD - subtotal),
      taxAmount,
      totalAmount
    }
  };
}

/**
 * Merges any guest session cart items into an authenticated user's cart,
 * capping quantities at available product stock.
 */
function mergeGuestCartToUser(sessionId, userId) {
  if (!sessionId || !userId) return;
  const db = getDb();

  const mergeTransaction = db.transaction(() => {
    const guestItems = db
      .prepare(
        `SELECT c.id, c.product_id, c.quantity, p.stock
         FROM cart_items c
         INNER JOIN products p ON p.id = c.product_id
         WHERE c.session_id = ? AND c.user_id IS NULL`
      )
      .all(sessionId);

    if (guestItems.length === 0) return;

    const findUserItem = db.prepare(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?'
    );
    const updateQty = db.prepare(
      'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    );
    const assignToUser = db.prepare(
      'UPDATE cart_items SET user_id = ?, session_id = NULL, quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    );
    const deleteGuestItem = db.prepare('DELETE FROM cart_items WHERE id = ?');

    for (const item of guestItems) {
      if (item.stock <= 0) {
        deleteGuestItem.run(item.id);
        continue;
      }

      const existing = findUserItem.get(userId, item.product_id);
      if (existing) {
        const mergedQty = Math.min(existing.quantity + item.quantity, item.stock);
        updateQty.run(mergedQty, existing.id);
        deleteGuestItem.run(item.id);
      } else {
        const cappedQty = Math.min(item.quantity, item.stock);
        assignToUser.run(userId, cappedQty, item.id);
      }
    }
  });

  mergeTransaction();
}

module.exports = {
  roundCurrency,
  getCartContext,
  buildCartResponse,
  mergeGuestCartToUser
};
