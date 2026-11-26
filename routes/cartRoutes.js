const express = require('express');
const { getDb } = require('../database/db');
const { AppError, parsePositiveInt } = require('../middleware/validate');
const { getCartContext, buildCartResponse } = require('../utils/cartService');

const router = express.Router();

function findCartRow(db, ctx, productId) {
  if (ctx.type === 'user') {
    return db
      .prepare('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?')
      .get(ctx.userId, productId);
  }
  return db
    .prepare(
      'SELECT id, quantity FROM cart_items WHERE session_id = ? AND user_id IS NULL AND product_id = ?'
    )
    .get(ctx.sessionId, productId);
}

// GET /api/cart
router.get('/', (req, res, next) => {
  try {
    const ctx = getCartContext(req);
    const cart = buildCartResponse(ctx);
    res.status(200).json(cart);
  } catch (err) {
    next(err);
  }
});

// POST /api/cart — Add product or increase quantity
router.post('/', (req, res, next) => {
  try {
    const productId = parsePositiveInt(req.body.productId);
    const quantity = req.body.quantity === undefined ? 1 : parsePositiveInt(req.body.quantity);

    if (!productId) {
      throw new AppError('A valid productId is required.', 400);
    }
    if (!quantity) {
      throw new AppError('Quantity must be a positive whole number.', 400);
    }

    const db = getDb();
    const product = db
      .prepare('SELECT id, name, stock FROM products WHERE id = ?')
      .get(productId);

    if (!product) {
      throw new AppError('Product not found.', 404);
    }
    if (product.stock <= 0) {
      throw new AppError(`${product.name} is currently out of stock.`, 400);
    }

    // Ensure session is persisted for guest carts
    if (!req.user && req.session) {
      req.session.cartActive = true;
    }

    const ctx = getCartContext(req);
    const existing = findCartRow(db, ctx, productId);
    const nextQty = (existing ? existing.quantity : 0) + quantity;

    if (nextQty > product.stock) {
      const remaining = Math.max(0, product.stock - (existing ? existing.quantity : 0));
      throw new AppError(
        remaining > 0
          ? `Only ${remaining} more unit(s) of ${product.name} available in stock (max ${product.stock}).`
          : `Maximum available stock (${product.stock}) of ${product.name} is already in your cart.`,
        400
      );
    }

    if (existing) {
      db.prepare(
        'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(nextQty, existing.id);
    } else if (ctx.type === 'user') {
      db.prepare(
        'INSERT INTO cart_items (user_id, session_id, product_id, quantity) VALUES (?, NULL, ?, ?)'
      ).run(ctx.userId, productId, nextQty);
    } else {
      db.prepare(
        'INSERT INTO cart_items (user_id, session_id, product_id, quantity) VALUES (NULL, ?, ?, ?)'
      ).run(ctx.sessionId, productId, nextQty);
    }

    const cart = buildCartResponse(ctx);
    res.status(201).json({
      message: `${product.name} added to cart.`,
      ...cart
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/cart/:productId — Update exact quantity (0 removes item)
router.put('/:productId', (req, res, next) => {
  try {
    const productId = parsePositiveInt(req.params.productId);
    const rawQty = Number(req.body.quantity);

    if (!productId) {
      throw new AppError('Invalid product ID.', 400);
    }
    if (!Number.isInteger(rawQty) || rawQty < 0) {
      throw new AppError('Quantity must be a non-negative integer.', 400);
    }

    const db = getDb();
    const ctx = getCartContext(req);
    const existing = findCartRow(db, ctx, productId);

    if (!existing) {
      throw new AppError('Item not found in your cart.', 404);
    }

    if (rawQty === 0) {
      db.prepare('DELETE FROM cart_items WHERE id = ?').run(existing.id);
      return res.status(200).json({
        message: 'Item removed from cart.',
        ...buildCartResponse(ctx)
      });
    }

    const product = db
      .prepare('SELECT id, name, stock FROM products WHERE id = ?')
      .get(productId);

    if (!product || product.stock <= 0) {
      throw new AppError('This product is no longer available in stock.', 400);
    }

    if (rawQty > product.stock) {
      throw new AppError(
        `Requested quantity (${rawQty}) exceeds available stock (${product.stock}) for ${product.name}.`,
        400
      );
    }

    db.prepare(
      'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(rawQty, existing.id);

    res.status(200).json({
      message: 'Cart updated.',
      ...buildCartResponse(ctx)
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart/:productId — Remove item from cart
router.delete('/:productId', (req, res, next) => {
  try {
    const productId = parsePositiveInt(req.params.productId);
    if (!productId) {
      throw new AppError('Invalid product ID.', 400);
    }

    const db = getDb();
    const ctx = getCartContext(req);
    const existing = findCartRow(db, ctx, productId);

    if (!existing) {
      throw new AppError('Item not found in your cart.', 404);
    }

    db.prepare('DELETE FROM cart_items WHERE id = ?').run(existing.id);
    res.status(200).json({
      message: 'Item removed from cart.',
      ...buildCartResponse(ctx)
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart — Clear all items in cart
router.delete('/', (req, res, next) => {
  try {
    const db = getDb();
    const ctx = getCartContext(req);

    if (ctx.type === 'user') {
      db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(ctx.userId);
    } else {
      db.prepare('DELETE FROM cart_items WHERE session_id = ? AND user_id IS NULL').run(
        ctx.sessionId
      );
    }

    res.status(200).json({
      message: 'Cart cleared.',
      ...buildCartResponse(ctx)
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
