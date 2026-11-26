const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

// Point DB_PATH to an isolated temporary SQLite file before loading app modules
const tempDbPath = path.join(os.tmpdir(), `codealpha-test-${Date.now()}.db`);
process.env.DB_PATH = tempDbPath;
process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'test_session_secret_value';

const { createApp } = require('../server');
const { getDb, closeDb } = require('../database/db');

let server;
let baseUrl;

/**
 * Minimal cookie jar helper for native fetch across stateful session requests.
 */
function createSessionClient() {
  const cookies = new Map();

  function updateCookies(res) {
    const setCookieHeader =
      typeof res.headers.getSetCookie === 'function'
        ? res.headers.getSetCookie()
        : res.headers.get('set-cookie')
        ? [res.headers.get('set-cookie')]
        : [];

    for (const raw of setCookieHeader) {
      const pair = raw.split(';')[0];
      const eqIdx = pair.indexOf('=');
      if (eqIdx > 0) {
        const name = pair.slice(0, eqIdx).trim();
        const val = pair.slice(eqIdx + 1).trim();
        if (val === '' || raw.toLowerCase().includes('max-age=0')) {
          cookies.delete(name);
        } else {
          cookies.set(name, val);
        }
      }
    }
  }

  function getCookieHeader() {
    return Array.from(cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }

  async function request(routePath, options = {}) {
    const headers = { ...(options.headers || {}) };
    const cookieHeader = getCookieHeader();
    if (cookieHeader) {
      headers.Cookie = cookieHeader;
    }
    let body = options.body;
    if (body && typeof body === 'object') {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(body);
    }

    const res = await fetch(`${baseUrl}${routePath}`, {
      method: options.method || 'GET',
      headers,
      body
    });
    updateCookies(res);

    const contentType = res.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await res.json() : await res.text();
    return { status: res.status, data: payload, res };
  }

  return { request };
}

test.before(async () => {
  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      baseUrl = `http://127.0.0.1:${addr.port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  closeDb();
  for (const suffix of ['', '-wal', '-shm']) {
    const file = `${tempDbPath}${suffix}`;
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }
});

test('HTML page routes and health check return 200 OK', async () => {
  const client = createSessionClient();
  const health = await client.request('/api/health');
  assert.equal(health.status, 200);
  assert.equal(health.data.status, 'ok');

  const pages = [
    '/',
    '/shop',
    '/product',
    '/cart',
    '/checkout',
    '/orders',
    '/order-confirmation',
    '/login',
    '/register'
  ];
  for (const page of pages) {
    const res = await client.request(page);
    assert.equal(res.status, 200, `Expected 200 for ${page}`);
    assert.match(res.data, /<!DOCTYPE html>/i);
  }
});

test('Products API seeds >= 100 products across 12 categories and supports search, filter, sort, pagination, and details', async () => {
  const client = createSessionClient();

  const allRes = await client.request('/api/products');
  assert.equal(allRes.status, 200);
  assert.ok(allRes.data.products.length >= 100);
  assert.equal(allRes.data.categories.length, 12);

  // Pagination check
  const page1 = await client.request('/api/products?limit=24&page=1');
  assert.equal(page1.status, 200);
  assert.equal(page1.data.products.length, 24);
  assert.equal(page1.data.hasMore, true);
  assert.ok(page1.data.total >= 100);

  // Search by name & brand
  const searchRes = await client.request('/api/products/search?q=AeroPulse');
  assert.equal(searchRes.status, 200);
  assert.equal(searchRes.data.products.length, 1);
  assert.match(searchRes.data.products[0].name, /AeroPulse/);
  assert.equal(searchRes.data.products[0].brand, 'AeroPulse');

  // Popularity sort
  const popularRes = await client.request('/api/products?sort=popular&limit=10');
  assert.equal(popularRes.status, 200);
  for (let i = 1; i < popularRes.data.products.length; i++) {
    assert.ok(popularRes.data.products[i].reviewCount <= popularRes.data.products[i - 1].reviewCount);
  }

  // Filter by category + sort price ascending
  const catRes = await client.request('/api/products?category=Electronics&sort=price_asc');
  assert.equal(catRes.status, 200);
  assert.ok(catRes.data.products.length >= 9);
  for (let i = 1; i < catRes.data.products.length; i++) {
    assert.ok(catRes.data.products[i].price >= catRes.data.products[i - 1].price);
    assert.equal(catRes.data.products[i].category, 'Electronics');
  }

  // Single product details
  const firstId = allRes.data.products[0].id;
  const detailRes = await client.request(`/api/products/${firstId}`);
  assert.equal(detailRes.status, 200);
  assert.equal(detailRes.data.product.id, firstId);
  assert.ok(Array.isArray(detailRes.data.relatedProducts));

  // Missing product returns 404
  const notFoundRes = await client.request('/api/products/999999');
  assert.equal(notFoundRes.status, 404);
});

test('Cart operations enforce stock limits and persist across requests', async () => {
  const client = createSessionClient();
  const productsRes = await client.request('/api/products');
  const watch = productsRes.data.products.find((p) => p.slug === 'vanguard-titanium-everyday-watch');
  assert.ok(watch);

  // Add 2 units
  const addRes = await client.request('/api/cart', {
    method: 'POST',
    body: { productId: watch.id, quantity: 2 }
  });
  assert.equal(addRes.status, 201);
  assert.equal(addRes.data.summary.itemCount, 2);

  // Exceeding stock fails with 400
  const excessRes = await client.request('/api/cart', {
    method: 'POST',
    body: { productId: watch.id, quantity: watch.stock + 5 }
  });
  assert.equal(excessRes.status, 400);

  // Update quantity to 3
  const updateRes = await client.request(`/api/cart/${watch.id}`, {
    method: 'PUT',
    body: { quantity: 3 }
  });
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.data.summary.itemCount, 3);

  // Remove item
  const deleteRes = await client.request(`/api/cart/${watch.id}`, { method: 'DELETE' });
  assert.equal(deleteRes.status, 200);
  assert.equal(deleteRes.data.summary.itemCount, 0);
});

test('Auth hashes passwords, merges guest cart, protects orders, and places atomic orders', async () => {
  const clientA = createSessionClient();
  const clientB = createSessionClient();

  // Protected route rejects unauthenticated access
  const unauthOrders = await clientA.request('/api/orders');
  assert.equal(unauthOrders.status, 401);

  const productsRes = await clientA.request('/api/products');
  const bottle = productsRes.data.products.find((p) => p.slug === 'hydrocore-insulated-titanium-bottle');
  const initialStock = bottle.stock;

  // Guest adds 2 bottles to cart before registering
  const guestAdd = await clientA.request('/api/cart', {
    method: 'POST',
    body: { productId: bottle.id, quantity: 2 }
  });
  assert.equal(guestAdd.status, 201);

  // Register User A
  const regA = await clientA.request('/api/auth/register', {
    method: 'POST',
    body: {
      name: 'Alice Tester',
      email: 'alice@example.com',
      password: 'Password123!'
    }
  });
  assert.equal(regA.status, 201);
  assert.equal(regA.data.user.email, 'alice@example.com');

  // Verify password is hashed in SQLite (never plaintext)
  const db = getDb();
  const userRow = db.prepare('SELECT password_hash FROM users WHERE email = ?').get('alice@example.com');
  assert.ok(userRow.password_hash.startsWith('$2'));
  assert.notEqual(userRow.password_hash, 'Password123!');

  // Duplicate email fails with 409
  const dupReg = await clientB.request('/api/auth/register', {
    method: 'POST',
    body: {
      name: 'Alice Clone',
      email: 'alice@example.com',
      password: 'Password123!'
    }
  });
  assert.equal(dupReg.status, 409);

  // Verify guest cart was merged into User A's cart
  const mergedCart = await clientA.request('/api/cart');
  assert.equal(mergedCart.status, 200);
  assert.equal(mergedCart.data.summary.itemCount, 2);

  // Checkout preview works
  const preview = await clientA.request('/api/checkout');
  assert.equal(preview.status, 200);
  assert.equal(preview.data.canCheckout, true);

  // Validation error on invalid phone number
  const badOrder = await clientA.request('/api/orders', {
    method: 'POST',
    body: {
      customerName: 'Alice Tester',
      deliveryAddress: '123 Innovation Drive, Tech City 94000',
      phoneNumber: '12',
      paymentMethod: 'Cash on Delivery'
    }
  });
  assert.equal(badOrder.status, 400);

  // Place valid order
  const orderRes = await clientA.request('/api/orders', {
    method: 'POST',
    body: {
      customerName: 'Alice Tester',
      deliveryAddress: '123 Innovation Drive, Tech City 94000',
      phoneNumber: '+1 555 234 5678',
      paymentMethod: 'Simulated Digital Wallet'
    }
  });
  assert.equal(orderRes.status, 201);
  assert.match(orderRes.data.order.orderNumber, /^CA-\d{8}-[A-F0-9]{6}$/);
  assert.equal(orderRes.data.order.items.length, 1);

  // Verify stock decremented & cart cleared
  const updatedProduct = await clientA.request(`/api/products/${bottle.id}`);
  assert.equal(updatedProduct.data.product.stock, initialStock - 2);
  const emptyCart = await clientA.request('/api/cart');
  assert.equal(emptyCart.data.summary.itemCount, 0);

  // User A can view order history
  const historyA = await clientA.request('/api/orders');
  assert.equal(historyA.status, 200);
  assert.equal(historyA.data.orders.length, 1);

  // Register User B and verify User B cannot access User A's order
  const regB = await clientB.request('/api/auth/register', {
    method: 'POST',
    body: {
      name: 'Bob Tester',
      email: 'bob@example.com',
      password: 'Password123!'
    }
  });
  assert.equal(regB.status, 201);

  const forbiddenOrderLookup = await clientB.request(
    `/api/orders/${orderRes.data.order.orderNumber}`
  );
  assert.equal(forbiddenOrderLookup.status, 404);

  // Logout and verify wrong password login
  const logoutRes = await clientA.request('/api/auth/logout', { method: 'POST' });
  assert.equal(logoutRes.status, 200);
  const meAfterLogout = await clientA.request('/api/auth/me');
  assert.equal(meAfterLogout.data.authenticated, false);

  const badLogin = await clientA.request('/api/auth/login', {
    method: 'POST',
    body: { email: 'alice@example.com', password: 'WrongPassword' }
  });
  assert.equal(badLogin.status, 401);

  const goodLogin = await clientA.request('/api/auth/login', {
    method: 'POST',
    body: { email: 'alice@example.com', password: 'Password123!' }
  });
  assert.equal(goodLogin.status, 200);
  assert.equal(goodLogin.data.user.email, 'alice@example.com');
});

test('Newsletter subscription stores email and rejects invalid email', async () => {
  const client = createSessionClient();
  const badSub = await client.request('/api/newsletter', {
    method: 'POST',
    body: { email: 'not-an-email' }
  });
  assert.equal(badSub.status, 400);

  const goodSub = await client.request('/api/newsletter', {
    method: 'POST',
    body: { email: 'subscriber@example.com' }
  });
  assert.equal(goodSub.status, 201);

  const dupSub = await client.request('/api/newsletter', {
    method: 'POST',
    body: { email: 'subscriber@example.com' }
  });
  assert.equal(dupSub.status, 200);
});
