const { AppError } = require('./validate');
const config = require('../config/env');

function notFoundHandler(req, res, next) {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
  }
  return res.status(404).sendFile('index.html', {
    root: require('path').resolve(__dirname, '..', 'public')
  });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  // Handle invalid JSON payloads cleanly
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON request payload.' });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err && err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({ error: 'A record with this value already exists.' });
  }

  if (!config.isProduction) {
    console.error('[Server Error]', err);
  }

  return res.status(500).json({
    error: 'An unexpected internal error occurred. Please try again later.'
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
