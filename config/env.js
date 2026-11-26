const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const isProduction = process.env.NODE_ENV === 'production';

// Use configured SESSION_SECRET or generate an ephemeral fallback in non-production
const sessionSecret =
  process.env.SESSION_SECRET ||
  (isProduction
    ? (() => {
        throw new Error('SESSION_SECRET environment variable must be set in production.');
      })()
    : crypto.randomBytes(32).toString('hex'));

module.exports = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  sessionSecret,
  dbPath: path.resolve(__dirname, '..', process.env.DB_PATH || './database/ecommerce.db'),
  bcryptRounds: 10
};
