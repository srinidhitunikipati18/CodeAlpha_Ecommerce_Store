const express = require('express');
const { getDb } = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const { AppError, sanitizeText, parsePositiveInt } = require('../middleware/validate');
const { hydrateOrder, placeOrderForUser } = require('../utils/orderService');

const router = express.Router();

// All order routes require authentication
router.use(requireAuth);

// GET /api/orders — Protected order history for the authenticated user
router.get('/', (req, res, next) => {
  try {
    const db = getDb();
    const orderRows = db
      .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC, id DESC')
      .all(req.user.id);

    const orders = orderRows.map((row) => hydrateOrder(db, row));
    res.status(200).json({ orders });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:orderId — Protected single order lookup (only owner can access)
router.get('/:orderId', (req, res, next) => {
  try {
    const db = getDb();
    const rawParam = sanitizeText(req.params.orderId);
    const numericId = parsePositiveInt(rawParam);

    const orderRow = numericId
      ? db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(numericId, req.user.id)
      : db
          .prepare('SELECT * FROM orders WHERE order_number = ? AND user_id = ?')
          .get(rawParam, req.user.id);

    if (!orderRow) {
      throw new AppError('Order not found.', 404);
    }

    res.status(200).json({ order: hydrateOrder(db, orderRow) });
  } catch (err) {
    next(err);
  }
});

// POST /api/orders — Place an order from the authenticated user's cart
router.post('/', (req, res, next) => {
  try {
    const order = placeOrderForUser(req.user.id, req.body);
    res.status(201).json({
      message: 'Order placed successfully!',
      order
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
