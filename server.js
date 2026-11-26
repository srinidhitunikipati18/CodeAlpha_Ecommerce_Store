const path = require('path');
const express = require('express');
const session = require('express-session');

const config = require('./config/env');
const { getDb } = require('./database/db');
const { seedProducts } = require('./database/seed');
const SQLiteSessionStore = require('./database/sessionStore');
const { attachUser } = require('./middleware/auth');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const orderRoutes = require('./routes/orderRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');

function createApp() {
  // Initialize SQLite schema and ensure sample catalog is seeded
  getDb();
  seedProducts();

  const app = express();
  const publicDir = path.resolve(__dirname, 'public');

  if (config.isProduction) {
    app.set('trust proxy', 1);
  }

  // Body parsing middleware
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false }));

  // Persistent SQLite-backed session middleware
  app.use(
    session({
      store: new SQLiteSessionStore(),
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.isProduction,
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      }
    })
  );

  // Attach logged-in user (if session authenticated)
  app.use(attachUser);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'CodeAlpha_Ecommerce_Store' });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/checkout', checkoutRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/newsletter', newsletterRoutes);

  // Static files
  app.use(express.static(publicDir));

  // Clean HTML page routes
  const pageRoutes = {
    '/': 'index.html',
    '/shop': 'shop.html',
    '/product': 'product.html',
    '/cart': 'cart.html',
    '/checkout': 'checkout.html',
    '/order-confirmation': 'order-confirmation.html',
    '/orders': 'orders.html',
    '/login': 'login.html',
    '/register': 'register.html'
  };

  Object.entries(pageRoutes).forEach(([routePath, fileName]) => {
    app.get(routePath, (req, res) => {
      res.sendFile(path.join(publicDir, fileName));
    });
  });

  // 404 & Centralized Error Handler
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

if (require.main === module) {
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`CodeAlpha E-Commerce Store running at http://localhost:${config.port}`);
  });
}

module.exports = { createApp };
