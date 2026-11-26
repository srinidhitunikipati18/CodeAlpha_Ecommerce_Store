const { getDb } = require('../database/db');

/**
 * Attaches the authenticated user record (without password_hash) to req.user
 * whenever a valid user session exists.
 */
function attachUser(req, res, next) {
  req.user = null;
  if (!req.session || !req.session.userId) {
    return next();
  }

  try {
    const db = getDb();
    const user = db
      .prepare('SELECT id, name, email, created_at FROM users WHERE id = ?')
      .get(req.session.userId);

    if (!user) {
      delete req.session.userId;
      return next();
    }

    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

/**
 * Protects private API endpoints by requiring an authenticated session.
 */
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required. Please log in to continue.'
    });
  }
  return next();
}

module.exports = {
  attachUser,
  requireAuth
};
