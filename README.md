# CodeAlpha_Ecommerce_Store

A full-stack, responsive e-commerce web application built for the **CodeAlpha Full Stack Development Internship (Task 1 — Simple E-commerce Store)**. Designed with a modern storefront UI, RESTful Express.js backend, persistent SQLite database, session-based authentication with bcrypt password hashing, real-time stock validation, and an atomic checkout/order workflow.

---

## Project Overview

**CodeAlpha Store** provides a complete end-to-end online shopping experience where customers can browse curated electronics, workspace gear, fashion accessories, and lifestyle products, search and filter the catalog, inspect detailed product specifications, manage a persistent shopping cart, register/sign in securely, place orders through a simulated checkout flow, and review their protected order history.

---

## Features

- **Modern Responsive Storefront**:
  - Sticky navigation bar with live search, mobile drawer menu, authentication controls, and dynamic cart item counter.
  - Hero banner, category showcase, featured products, trending products, About section, Contact section, and working newsletter subscription.
- **Product Management & Discovery**:
  - 108 pre-seeded sample products across 12 categories stored in SQLite with brands, INR prices, stock counts, ratings, and technical specifications.
  - Search by product name, brand, or description, filter by category, and sort by featured, popularity, price (low-to-high / high-to-low), rating, or newest.
  - Load More pagination on the Shop catalog and dedicated product detail view with stock badges, quantity selector capped at available stock, and related products.
- **Shopping Cart**:
  - Add, increment, decrement, remove, or clear items with live SQLite persistence for both guest sessions and authenticated users.
  - Automatic guest-to-user cart merge upon login or registration.
  - Server-side calculation of subtotal, free-shipping threshold (₹999+), estimated GST (18%), and total in INR (`en-IN`).
  - Strict stock validation preventing unavailable or excessive quantities.
- **User Authentication & Security**:
  - Registration, login, and logout backed by `bcrypt` password hashing and `express-session` with a persistent SQLite session store.
  - Session regeneration on login/registration to prevent session fixation.
  - Protected checkout and order history routes enforcing strict per-user order ownership.
- **Checkout & Order Processing**:
  - Shipping details validation (recipient name, phone number, delivery address) and simulated payment method selection (no real card data collected).
  - Atomic database transaction verifying stock, decrementing inventory, generating a unique order ID (`CA-YYYYMMDD-XXXXXX`), creating order line items, and clearing the cart.
  - Dedicated Order Confirmation receipt page and protected Order History page.

---

## Technology Stack

- **Frontend**: HTML5, CSS3 (Responsive Flexbox/Grid, CSS Custom Properties), Vanilla JavaScript (ES6+)
- **Backend**: Node.js, Express.js, Express Session (`express-session`)
- **Database**: SQLite (`better-sqlite3`)
- **Security & Configuration**: `bcrypt`, `dotenv`

---

## Project Folder Structure

```text
CodeAlpha_Ecommerce_Store/
├── config/
│   └── env.js                 # Environment variable loading and validation
├── database/
│   ├── db.js                  # SQLite connection, WAL mode, and schema initialization
│   ├── init.js                # Standalone DB initialization & seeding script
│   ├── seed.js                # 14 sample products across 5 categories
│   └── sessionStore.js        # Persistent SQLite store for express-session
├── middleware/
│   ├── auth.js                # attachUser and requireAuth middleware
│   ├── errorHandler.js        # 404 and centralized error handling
│   └── validate.js            # Input sanitization, validation helpers, and AppError
├── public/
│   ├── css/
│   │   └── styles.css         # Responsive modern UI styles
│   ├── images/
│   │   ├── hero-showcase.svg  # Hero banner visual
│   │   └── products/          # Product studio SVG illustrations
│   ├── js/
│   │   ├── api.js             # Fetch wrapper & REST API client
│   │   ├── app.js             # Shared navbar, footer, cart badge, toasts, cards
│   │   ├── auth.js            # Login & registration form logic
│   │   ├── cart.js            # Shopping cart page controller
│   │   ├── checkout.js        # Checkout validation & submission
│   │   ├── home.js            # Homepage categories, featured, trending, newsletter
│   │   ├── orders.js          # Order confirmation & order history pages
│   │   ├── product.js         # Product details & quantity stepper
│   │   └── shop.js            # Catalog search, category filters, and sorting
│   ├── cart.html
│   ├── checkout.html
│   ├── index.html
│   ├── login.html
│   ├── order-confirmation.html
│   ├── orders.html
│   ├── product.html
│   ├── register.html
│   └── shop.html
├── routes/
│   ├── authRoutes.js          # /api/auth/*
│   ├── cartRoutes.js          # /api/cart/*
│   ├── checkoutRoutes.js      # /api/checkout/*
│   ├── newsletterRoutes.js    # /api/newsletter
│   ├── orderRoutes.js         # /api/orders/*
│   └── productRoutes.js       # /api/products/*
├── tests/
│   └── api.test.js            # Automated end-to-end API & integration tests
├── utils/
│   ├── cartService.js         # Cart totals calculation & guest-to-user merge
│   └── orderService.js        # Checkout preview & atomic order placement
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js                  # Express app entry point
```

---

## Installation Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/srinidhitunikipati18/CodeAlpha_Ecommerce_Store.git
   cd CodeAlpha_Ecommerce_Store
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Copy `.env.example` to `.env` and update `SESSION_SECRET` with a secure random string:
   ```bash
   cp .env.example .env
   ```
   *(On Windows PowerShell: `Copy-Item .env.example .env`)*

---

## Database Setup

The SQLite database initializes and seeds 14 sample products automatically on server startup. You can also initialize it explicitly before running the app:

```bash
npm run init-db
```

Tables created in `./database/ecommerce.db`:
- `users` — registered customer accounts (`id`, `name`, `email`, `password_hash`, `created_at`)
- `products` — product catalog (`id`, `name`, `slug`, `description`, `price`, `original_price`, `category`, `image_url`, `stock`, `rating`, `review_count`, `is_featured`, `is_trending`, `specs`)
- `cart_items` — persistent guest and user cart items linked to `users` and `products`
- `orders` — confirmed customer orders linked to `users` with unique `order_number`
- `order_items` — line items snapshot linked to `orders` and `products`
- `sessions` — persistent Express session storage
- `newsletter_subscribers` — newsletter subscriber emails

---

## How to Run the Project

- **Start the production server:**
  ```bash
  npm start
  ```
- **Start in development watch mode (Node 20+):**
  ```bash
  npm run dev
  ```
- **Run the automated API & integration test suite:**
  ```bash
  npm test
  ```

Once running, open your browser and visit:
`http://localhost:3000`

---

## Screenshots

> Add screenshots of your running application to a `docs/screenshots/` folder before pushing to GitHub, then link them below:

| Page | Preview |
| :--- | :--- |
| **Homepage** | *(Hero banner, categories, featured & trending products)* |
| **Shop Catalog** | *(Search, category filters, and price sorting)* |
| **Product Details** | *(Product specs, stock availability, and quantity stepper)* |
| **Cart & Checkout** | *(Live totals, shipping details, and simulated payment)* |
| **Order History** | *(Protected order tracking and itemized receipts)* |

---

## API Overview

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | No | Service health check |
| `POST` | `/api/auth/register` | No | Register a new customer account |
| `POST` | `/api/auth/login` | No | Log in and create persistent session |
| `POST` | `/api/auth/logout` | No | Destroy session and log out |
| `GET` | `/api/auth/me` | No | Get current authentication state |
| `GET` | `/api/products` | No | List products (`search`, `category`, `sort`, `featured`, `trending`) |
| `GET` | `/api/products/categories` | No | List categories with product counts |
| `GET` | `/api/products/search?q=` | No | Search products by keyword |
| `GET` | `/api/products/:id` | No | Get single product details and related products |
| `GET` | `/api/cart` | No | Retrieve current guest or user cart |
| `POST` | `/api/cart` | No | Add item to cart with stock check |
| `PUT` | `/api/cart/:productId` | No | Update cart item quantity (`0` removes item) |
| `DELETE` | `/api/cart/:productId` | No | Remove item from cart |
| `DELETE` | `/api/cart` | No | Clear entire cart |
| `GET` | `/api/checkout` | Yes | Validate cart and preview checkout totals |
| `POST` | `/api/checkout` | Yes | Submit checkout and place order |
| `POST` | `/api/orders` | Yes | Place order atomically and decrement stock |
| `GET` | `/api/orders` | Yes | Fetch authenticated user's order history |
| `GET` | `/api/orders/:orderId` | Yes | Fetch single order receipt (owner-only) |
| `POST` | `/api/newsletter` | No | Subscribe email to newsletter |

---

## License

MIT License — built for educational and internship portfolio evaluation.
