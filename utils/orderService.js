const crypto = require('crypto');
const { getDb } = require('../database/db');
const { AppError, sanitizeText, isValidPhone } = require('../middleware/validate');
const { roundCurrency, buildCartResponse } = require('./cartService');

const ALLOWED_PAYMENT_METHODS = [
  'Cash on Delivery',
  'Simulated Digital Wallet',
  'Simulated Test Card'
];

function generateOrderNumber() {
  const now = new Date();
  const datePart = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, '0'),
    String(now.getUTCDate()).padStart(2, '0')
  ].join('');
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `CA-${datePart}-${randomPart}`;
}

function hydrateOrder(db, orderRow) {
  const items = db
    .prepare(
      `SELECT id, product_id AS productId, product_name AS productName,
              product_image AS productImage, unit_price AS unitPrice,
              quantity, line_total AS lineTotal
       FROM order_items
       WHERE order_id = ?
       ORDER BY id ASC`
    )
    .all(orderRow.id);

  return {
    id: orderRow.id,
    orderNumber: orderRow.order_number,
    customerName: orderRow.customer_name,
    deliveryAddress: orderRow.delivery_address,
    phoneNumber: orderRow.phone_number,
    paymentMethod: orderRow.payment_method,
    subtotal: orderRow.subtotal,
    shippingFee: orderRow.shipping_fee,
    taxAmount: orderRow.tax_amount,
    totalAmount: orderRow.total_amount,
    status: orderRow.status,
    createdAt: orderRow.created_at,
    items
  };
}

function getCheckoutPreview(user) {
  const cart = buildCartResponse({ type: 'user', userId: user.id });
  const stockIssues = cart.items
    .filter((item) => item.stock <= 0 || item.quantity > item.stock)
    .map((item) => ({
      productId: item.productId,
      name: item.name,
      requested: item.quantity,
      available: item.stock
    }));

  return {
    customer: {
      name: user.name,
      email: user.email
    },
    allowedPaymentMethods: ALLOWED_PAYMENT_METHODS,
    canCheckout: cart.items.length > 0 && stockIssues.length === 0,
    stockIssues,
    ...cart
  };
}

function placeOrderForUser(userId, payload) {
  const customerName = sanitizeText(payload.customerName);
  const deliveryAddress = sanitizeText(payload.deliveryAddress);
  const phoneNumber = sanitizeText(payload.phoneNumber);
  const paymentMethod = sanitizeText(payload.paymentMethod || 'Cash on Delivery');

  if (customerName.length < 2 || customerName.length > 100) {
    throw new AppError('Customer full name must be between 2 and 100 characters.', 400);
  }
  if (deliveryAddress.length < 10 || deliveryAddress.length > 350) {
    throw new AppError('Please enter a complete delivery address (10-350 characters).', 400);
  }
  if (!isValidPhone(phoneNumber)) {
    throw new AppError('Please provide a valid phone number (7-15 digits).', 400);
  }
  if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
    throw new AppError('Please select a valid simulated payment method.', 400);
  }

  const db = getDb();

  const placeOrderTx = db.transaction(() => {
    const cartRows = db
      .prepare(
        `SELECT
           c.id AS cart_item_id,
           c.product_id,
           c.quantity,
           p.name,
           p.price,
           p.stock,
           p.image_url
         FROM cart_items c
         INNER JOIN products p ON p.id = c.product_id
         WHERE c.user_id = ?
         ORDER BY c.created_at ASC`
      )
      .all(userId);

    if (cartRows.length === 0) {
      throw new AppError('Your shopping cart is empty. Add items before checking out.', 400);
    }

    let subtotal = 0;
    const lineItems = [];

    for (const row of cartRows) {
      if (row.stock <= 0) {
        throw new AppError(`"${row.name}" is out of stock. Please remove it from your cart.`, 400);
      }
      if (row.quantity > row.stock) {
        throw new AppError(
          `Only ${row.stock} unit(s) of "${row.name}" remain in stock. Please adjust your cart quantity.`,
          400
        );
      }

      const lineTotal = roundCurrency(row.price * row.quantity);
      subtotal += lineTotal;
      lineItems.push({
        productId: row.product_id,
        productName: row.name,
        productImage: row.image_url,
        unitPrice: row.price,
        quantity: row.quantity,
        lineTotal
      });
    }

    subtotal = roundCurrency(subtotal);
    const shippingFee = subtotal >= 999 ? 0 : 79;
    const taxAmount = roundCurrency(subtotal * 0.18);
    const totalAmount = roundCurrency(subtotal + shippingFee + taxAmount);
    const orderNumber = generateOrderNumber();

    const orderResult = db
      .prepare(
        `INSERT INTO orders (
           order_number, user_id, customer_name, delivery_address, phone_number,
           payment_method, subtotal, shipping_fee, tax_amount, total_amount, status
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed')`
      )
      .run(
        orderNumber,
        userId,
        customerName,
        deliveryAddress,
        phoneNumber,
        paymentMethod,
        subtotal,
        shippingFee,
        taxAmount,
        totalAmount
      );

    const orderId = orderResult.lastInsertRowid;

    const insertOrderItem = db.prepare(
      `INSERT INTO order_items (
         order_id, product_id, product_name, product_image, unit_price, quantity, line_total
       ) VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    const decrementStock = db.prepare(
      'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?'
    );

    for (const item of lineItems) {
      const stockUpdate = decrementStock.run(item.quantity, item.productId, item.quantity);
      if (stockUpdate.changes === 0) {
        throw new AppError(`Insufficient stock for "${item.productName}".`, 409);
      }
      insertOrderItem.run(
        orderId,
        item.productId,
        item.productName,
        item.productImage,
        item.unitPrice,
        item.quantity,
        item.lineTotal
      );
    }

    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);

    const createdOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    return hydrateOrder(db, createdOrder);
  });

  return placeOrderTx();
}

module.exports = {
  ALLOWED_PAYMENT_METHODS,
  hydrateOrder,
  getCheckoutPreview,
  placeOrderForUser
};
