const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('../config/env');

let dbInstance = null;

/**
 * Returns the singleton SQLite database connection, creating the file and
 * initializing tables if needed.
 */
function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const dbDir = path.dirname(config.dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  dbInstance = new Database(config.dbPath);
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');

  initializeSchema(dbInstance);
  return dbInstance;
}

/**
 * Creates all application tables and indexes if they do not exist.
 */
function initializeSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      brand TEXT NOT NULL DEFAULT 'CodeAlpha',
      description TEXT NOT NULL,
      price REAL NOT NULL CHECK(price >= 0),
      original_price REAL,
      category TEXT NOT NULL,
      image_url TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
      rating REAL NOT NULL DEFAULT 4.5,
      review_count INTEGER NOT NULL DEFAULT 0,
      is_featured INTEGER NOT NULL DEFAULT 0,
      is_trending INTEGER NOT NULL DEFAULT 0,
      specs TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      session_id TEXT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_user_product
      ON cart_items(user_id, product_id)
      WHERE user_id IS NOT NULL;

    CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_session_product
      ON cart_items(session_id, product_id)
      WHERE session_id IS NOT NULL AND user_id IS NULL;

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      customer_name TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      subtotal REAL NOT NULL CHECK(subtotal >= 0),
      shipping_fee REAL NOT NULL DEFAULT 0 CHECK(shipping_fee >= 0),
      tax_amount REAL NOT NULL DEFAULT 0 CHECK(tax_amount >= 0),
      total_amount REAL NOT NULL CHECK(total_amount >= 0),
      status TEXT NOT NULL DEFAULT 'Confirmed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id),
      product_name TEXT NOT NULL,
      product_image TEXT NOT NULL,
      unit_price REAL NOT NULL CHECK(unit_price >= 0),
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      line_total REAL NOT NULL CHECK(line_total >= 0)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      sid TEXT PRIMARY KEY,
      sess TEXT NOT NULL,
      expired INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_expired ON sessions(expired);

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Safe migration for existing databases lacking the brand column
  const productColumns = db.prepare('PRAGMA table_info(products)').all();
  if (!productColumns.some((col) => col.name === 'brand')) {
    db.exec("ALTER TABLE products ADD COLUMN brand TEXT NOT NULL DEFAULT 'CodeAlpha'");
  }
}

function closeDb() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

module.exports = {
  getDb,
  initializeSchema,
  closeDb
};
