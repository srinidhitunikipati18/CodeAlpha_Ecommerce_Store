const express = require('express');
const bcrypt = require('bcrypt');
const { getDb } = require('../database/db');
const config = require('../config/env');
const { AppError, sanitizeText, isValidEmail } = require('../middleware/validate');
const { mergeGuestCartToUser } = require('../utils/cartService');

const router = express.Router();

/**
 * Regenerates the Express session to prevent session fixation, sets userId,
 * and merges any pre-login guest cart into the authenticated user's cart.
 */
function establishUserSession(req, userId) {
  return new Promise((resolve, reject) => {
    const previousSessionId = req.sessionID;
    req.session.regenerate((regenErr) => {
      if (regenErr) return reject(regenErr);
      req.session.userId = userId;
      mergeGuestCartToUser(previousSessionId, userId);
      req.session.save((saveErr) => {
        if (saveErr) return reject(saveErr);
        resolve();
      });
    });
  });
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const name = sanitizeText(req.body.name);
    const email = sanitizeText(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (name.length < 2 || name.length > 80) {
      throw new AppError('Full name must be between 2 and 80 characters.', 400);
    }
    if (!isValidEmail(email)) {
      throw new AppError('Please provide a valid email address.', 400);
    }
    if (password.length < 6 || password.length > 128) {
      throw new AppError('Password must be between 6 and 128 characters.', 400);
    }

    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      throw new AppError('An account with this email already exists.', 409);
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
    const result = db
      .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
      .run(name, email, passwordHash);

    const user = db
      .prepare('SELECT id, name, email, created_at FROM users WHERE id = ?')
      .get(result.lastInsertRowid);

    await establishUserSession(req, user.id);

    res.status(201).json({
      message: 'Account created successfully.',
      user
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const email = sanitizeText(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!isValidEmail(email) || !password) {
      throw new AppError('Please enter both a valid email address and password.', 400);
    }

    const db = getDb();
    const userRecord = db
      .prepare('SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?')
      .get(email);

    if (!userRecord) {
      throw new AppError('Invalid email or password.', 401);
    }

    const passwordMatches = await bcrypt.compare(password, userRecord.password_hash);
    if (!passwordMatches) {
      throw new AppError('Invalid email or password.', 401);
    }

    await establishUserSession(req, userRecord.id);

    res.status(200).json({
      message: 'Logged in successfully.',
      user: {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        created_at: userRecord.created_at
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res, next) => {
  if (!req.session) {
    return res.status(200).json({ message: 'Logged out successfully.' });
  }
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Logged out successfully.' });
  });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  res.status(200).json({
    authenticated: Boolean(req.user),
    user: req.user || null
  });
});

module.exports = router;
