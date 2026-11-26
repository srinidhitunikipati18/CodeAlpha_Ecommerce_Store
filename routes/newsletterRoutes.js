const express = require('express');
const { getDb } = require('../database/db');
const { AppError, sanitizeText, isValidEmail } = require('../middleware/validate');

const router = express.Router();

// POST /api/newsletter
router.post('/', (req, res, next) => {
  try {
    const email = sanitizeText(req.body.email).toLowerCase();
    if (!isValidEmail(email)) {
      throw new AppError('Please enter a valid email address.', 400);
    }

    const db = getDb();
    const result = db
      .prepare('INSERT OR IGNORE INTO newsletter_subscribers (email) VALUES (?)')
      .run(email);

    if (result.changes === 0) {
      return res.status(200).json({
        message: 'You are already subscribed to CodeAlpha Store updates!'
      });
    }

    return res.status(201).json({
      message: 'Thank you for subscribing! Watch your inbox for curated drops and deals.'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
