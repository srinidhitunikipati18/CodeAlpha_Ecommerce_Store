const express = require('express');
const { getDb } = require('../database/db');
const { AppError, sanitizeText, parsePositiveInt } = require('../middleware/validate');

const router = express.Router();

function formatProduct(row) {
  let specs = {};
  if (row.specs) {
    try {
      specs = JSON.parse(row.specs);
    } catch (_) {
      specs = {};
    }
  }
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    brand: row.brand || 'CodeAlpha',
    description: row.description,
    price: row.price,
    originalPrice: row.original_price,
    category: row.category,
    imageUrl: row.image_url,
    stock: row.stock,
    rating: row.rating,
    reviewCount: row.review_count,
    isFeatured: Boolean(row.is_featured),
    isTrending: Boolean(row.is_trending),
    specs,
    createdAt: row.created_at
  };
}

function queryProducts(queryParams) {
  const db = getDb();
  const search = sanitizeText(queryParams.search || queryParams.q || '');
  const category = sanitizeText(queryParams.category || '');
  const sort = sanitizeText(queryParams.sort || 'featured');
  const featuredOnly = queryParams.featured === '1' || queryParams.featured === 'true';
  const trendingOnly = queryParams.trending === '1' || queryParams.trending === 'true';

  const conditions = [];
  const params = [];

  if (search) {
    conditions.push(
      '(LOWER(name) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category) LIKE ?)'
    );
    const pattern = `%${search.toLowerCase()}%`;
    params.push(pattern, pattern, pattern, pattern);
  }

  if (category && category.toLowerCase() !== 'all') {
    conditions.push('LOWER(category) = ?');
    params.push(category.toLowerCase());
  }

  if (featuredOnly) {
    conditions.push('is_featured = 1');
  }

  if (trendingOnly) {
    conditions.push('is_trending = 1');
  }

  const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  let orderBySql = 'ORDER BY is_featured DESC, is_trending DESC, id ASC';
  switch (sort) {
    case 'price_asc':
      orderBySql = 'ORDER BY price ASC, id ASC';
      break;
    case 'price_desc':
      orderBySql = 'ORDER BY price DESC, id ASC';
      break;
    case 'rating':
      orderBySql = 'ORDER BY rating DESC, review_count DESC';
      break;
    case 'popular':
      orderBySql = 'ORDER BY review_count DESC, rating DESC, id ASC';
      break;
    case 'newest':
      orderBySql = 'ORDER BY id DESC';
      break;
    default:
      orderBySql = 'ORDER BY is_featured DESC, is_trending DESC, id ASC';
  }

  const rows = db.prepare(`SELECT * FROM products ${whereSql} ${orderBySql}`).all(...params);
  return rows.map(formatProduct);
}

// GET /api/products
router.get('/', (req, res, next) => {
  try {
    const db = getDb();
    const allProducts = queryProducts(req.query);
    const total = allProducts.length;

    const rawLimit = parsePositiveInt(req.query.limit);
    const rawPage = parsePositiveInt(req.query.page) || 1;
    let products = allProducts;
    let totalPages = 1;
    let hasMore = false;

    if (rawLimit) {
      totalPages = Math.max(1, Math.ceil(total / rawLimit));
      const start = (rawPage - 1) * rawLimit;
      products = allProducts.slice(start, start + rawLimit);
      hasMore = start + products.length < total;
    }

    const categories = db
      .prepare('SELECT category AS name, COUNT(*) AS count FROM products GROUP BY category ORDER BY category ASC')
      .all();

    res.status(200).json({
      products,
      total,
      page: rawPage,
      totalPages,
      hasMore,
      categories
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/categories
router.get('/categories', (req, res, next) => {
  try {
    const db = getDb();
    const categories = db
      .prepare('SELECT category AS name, COUNT(*) AS count FROM products GROUP BY category ORDER BY category ASC')
      .all();
    res.status(200).json({ categories });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/search?q=...
router.get('/search', (req, res, next) => {
  try {
    const products = queryProducts(req.query);
    res.status(200).json({
      query: sanitizeText(req.query.q || req.query.search || ''),
      products,
      total: products.length
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get('/:id', (req, res, next) => {
  try {
    const db = getDb();
    const rawId = sanitizeText(req.params.id);
    const numericId = parsePositiveInt(rawId);

    const row = numericId
      ? db.prepare('SELECT * FROM products WHERE id = ?').get(numericId)
      : db.prepare('SELECT * FROM products WHERE slug = ?').get(rawId);

    if (!row) {
      throw new AppError('Product not found.', 404);
    }

    const relatedRows = db
      .prepare(
        'SELECT * FROM products WHERE category = ? AND id != ? ORDER BY is_featured DESC, rating DESC LIMIT 4'
      )
      .all(row.category, row.id);

    res.status(200).json({
      product: formatProduct(row),
      relatedProducts: relatedRows.map(formatProduct)
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
