const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getCheckoutPreview, placeOrderForUser } = require('../utils/orderService');

const router = express.Router();

router.use(requireAuth);

// GET /api/checkout — Validate cart & return checkout summary
router.get('/', (req, res, next) => {
  try {
    const summary = getCheckoutPreview(req.user);
    res.status(200).json(summary);
  } catch (err) {
    next(err);
  }
});

// POST /api/checkout — Submit checkout & place order
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
