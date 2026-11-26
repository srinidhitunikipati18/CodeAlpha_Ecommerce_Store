const { getDb } = require('./db');
const { seedProducts } = require('./seed');

// Standalone script for `npm run init-db`
function initDatabase() {
  getDb();
  const result = seedProducts();
  console.log(
    `Database initialized successfully. Seeded ${result.seeded} new products (Total products: ${result.total}).`
  );
}

initDatabase();
