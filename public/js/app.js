/**
 * Shared layout shell (Navbar, Search, Auth state, Cart Badge, Toasts, Footer)
 * and reusable product card rendering.
 */
(function () {
  const { authApi, cartApi, formatPrice, escapeHtml } = window.StoreAPI;

  const state = {
    user: null,
    cartCount: 0
  };

  function getToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function showToast(message, type = 'default') {
    const container = getToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : ''}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = '0.2s ease';
      setTimeout(() => toast.remove(), 220);
    }, 3200);
  }

  function getActiveNavKey() {
    const path = window.location.pathname;
    if (path === '/' || path.endsWith('/index.html')) return 'home';
    if (path.includes('shop') || path.includes('product')) return 'shop';
    if (path.includes('orders')) return 'orders';
    return '';
  }

  function renderHeader() {
    const headerRoot = document.getElementById('site-header-root');
    if (!headerRoot) return;

    const activeKey = getActiveNavKey();
    const currentSearch = new URLSearchParams(window.location.search).get('search') || '';

    headerRoot.innerHTML = `
      <div class="announcement-bar">
        Free express shipping across India on orders over <strong>&#8377;999</strong> &middot; 100+ curated products across 12 categories
      </div>
      <header class="site-header">
        <div class="container header-inner">
          <a href="/" class="brand-logo" aria-label="CodeAlpha Store Home">
            <span class="brand-mark">CA</span>
            <span>CodeAlpha Store</span>
          </a>

          <ul class="nav-links">
            <li><a href="/" class="${activeKey === 'home' ? 'active' : ''}">Home</a></li>
            <li><a href="/shop" class="${activeKey === 'shop' ? 'active' : ''}">Shop</a></li>
            <li><a href="/#categories">Categories</a></li>
            <li><a href="/#about">About</a></li>
            <li><a href="/#contact">Contact</a></li>
          </ul>

          <form class="header-search" id="header-search-form" role="search">
            <input
              type="search"
              id="header-search-input"
              placeholder="Search products..."
              aria-label="Search products"
              value="${escapeHtml(currentSearch)}"
            />
            <button type="submit" aria-label="Submit search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>

          <div class="header-actions">
            <div class="auth-controls" id="header-auth-controls">
              <a href="/login" class="btn btn-ghost btn-sm">Login</a>
              <a href="/register" class="btn btn-primary btn-sm">Sign Up</a>
            </div>

            <a href="/cart" class="cart-btn" aria-label="Shopping Cart">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span class="btn-label-hide-sm">Cart</span>
              <span class="cart-badge" id="header-cart-badge">0</span>
            </a>

            <button
              type="button"
              class="mobile-menu-toggle"
              id="mobile-menu-toggle"
              aria-label="Toggle navigation menu"
              aria-expanded="false"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div class="mobile-drawer" id="mobile-drawer">
          <form class="header-search" id="mobile-search-form" style="display:block; max-width:none;">
            <input
              type="search"
              id="mobile-search-input"
              placeholder="Search products..."
              aria-label="Search products"
              value="${escapeHtml(currentSearch)}"
            />
            <button type="submit" aria-label="Submit mobile search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>
          <div class="mobile-drawer-links">
            <a href="/">Home</a>
            <a href="/shop">Shop All Products</a>
            <a href="/#categories">Categories</a>
            <a href="/#about">About Us</a>
            <a href="/#contact">Contact</a>
          </div>
          <div class="mobile-drawer-auth" id="mobile-drawer-auth">
            <a href="/login" class="btn btn-secondary btn-sm">Login</a>
            <a href="/register" class="btn btn-primary btn-sm">Sign Up</a>
          </div>
        </div>
      </header>
    `;

    const bindSearch = (formId, inputId) => {
      const form = document.getElementById(formId);
      const input = document.getElementById(inputId);
      if (!form || !input) return;
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const term = input.value.trim();
        const target = term ? `/shop?search=${encodeURIComponent(term)}` : '/shop';
        window.location.href = target;
      });
    };

    bindSearch('header-search-form', 'header-search-input');
    bindSearch('mobile-search-form', 'mobile-search-input');

    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const drawer = document.getElementById('mobile-drawer');
    if (toggleBtn && drawer) {
      toggleBtn.addEventListener('click', () => {
        const isOpen = drawer.classList.toggle('open');
        toggleBtn.setAttribute('aria-expanded', String(isOpen));
      });
    }
  }

  function renderFooter() {
    const footerRoot = document.getElementById('site-footer-root');
    if (!footerRoot) return;

    footerRoot.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <a href="/" class="brand-logo">
                <span class="brand-mark">CA</span>
                <span>CodeAlpha Store</span>
              </a>
              <p>
                Thoughtfully engineered electronics, workspace essentials, and modern lifestyle gear
                built for everyday performance.
              </p>
            </div>

            <div class="footer-col">
              <h4>Shop</h4>
              <ul>
                <li><a href="/shop">All Products</a></li>
                <li><a href="/shop?category=Electronics">Electronics</a></li>
                <li><a href="/shop?category=Mobiles">Mobiles</a></li>
                <li><a href="/shop?category=Laptops">Laptops</a></li>
                <li><a href="/shop?category=Men's%20Fashion">Men's Fashion</a></li>
                <li><a href="/shop?category=Women's%20Fashion">Women's Fashion</a></li>
              </ul>
            </div>

            <div class="footer-col">
              <h4>Account</h4>
              <ul>
                <li><a href="/cart">Shopping Cart</a></li>
                <li><a href="/orders">Order History</a></li>
                <li><a href="/login">Customer Login</a></li>
                <li><a href="/register">Create Account</a></li>
              </ul>
            </div>

            <div class="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="/#about">About CodeAlpha Store</a></li>
                <li><a href="/#contact">Customer Support</a></li>
                <li><a href="/#newsletter">Newsletter</a></li>
                <li><a href="/shop?sort=rating">Top Rated</a></li>
              </ul>
            </div>
          </div>

          <div class="footer-bottom">
            <span>&copy; ${new Date().getFullYear()} CodeAlpha_Ecommerce_Store. Built for CodeAlpha Full Stack Internship.</span>
            <span>Secure Session Auth &middot; SQLite Powered</span>
          </div>
        </div>
      </footer>
    `;
  }

  function updateAuthUI(user) {
    state.user = user;
    const container = document.getElementById('header-auth-controls');
    const mobileAuth = document.getElementById('mobile-drawer-auth');

    if (container) {
      if (user) {
        const firstName = escapeHtml(user.name.split(' ')[0]);
        container.innerHTML = `
          <span class="user-pill" title="${escapeHtml(user.email)}">
            <span>Hi, ${firstName}</span>
          </span>
          <a href="/orders" class="btn btn-ghost btn-sm">Orders</a>
          <button type="button" id="logout-btn" class="btn btn-secondary btn-sm">Logout</button>
        `;
      } else {
        container.innerHTML = `
          <a href="/login" class="btn btn-ghost btn-sm">Login</a>
          <a href="/register" class="btn btn-primary btn-sm">Sign Up</a>
        `;
      }
    }

    if (mobileAuth) {
      if (user) {
        const firstName = escapeHtml(user.name.split(' ')[0]);
        mobileAuth.innerHTML = `
          <span class="user-pill" style="justify-content:center;">Signed in as ${firstName}</span>
          <a href="/orders" class="btn btn-secondary btn-sm">My Orders</a>
          <button type="button" id="mobile-logout-btn" class="btn btn-danger-outline btn-sm">Logout</button>
        `;
      } else {
        mobileAuth.innerHTML = `
          <a href="/login" class="btn btn-secondary btn-sm">Login</a>
          <a href="/register" class="btn btn-primary btn-sm">Sign Up</a>
        `;
      }
    }

    const bindLogout = (btnId) => {
      const btn = document.getElementById(btnId);
      if (!btn) return;
      btn.addEventListener('click', async () => {
        try {
          await authApi.logout();
          showToast('You have been logged out.', 'success');
          window.location.href = '/';
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    };

    bindLogout('logout-btn');
    bindLogout('mobile-logout-btn');
  }

  function updateCartBadge(count) {
    state.cartCount = Number(count || 0);
    const badge = document.getElementById('header-cart-badge');
    if (badge) {
      badge.textContent = String(state.cartCount);
    }
  }

  async function syncShellState() {
    try {
      const [authRes, cartRes] = await Promise.all([authApi.me(), cartApi.get()]);
      updateAuthUI(authRes.user);
      updateCartBadge(cartRes.summary.itemCount);
      return { user: authRes.user, cart: cartRes };
    } catch (_) {
      return { user: null, cart: null };
    }
  }

  function getStockBadgeHtml(stock) {
    if (stock <= 0) {
      return '<span class="badge badge-danger">Out of Stock</span>';
    }
    if (stock <= 8) {
      return `<span class="badge badge-warning">Only ${stock} left</span>`;
    }
    return '<span class="badge badge-success">In Stock</span>';
  }

  function renderProductCard(product) {
    const discountPct =
      product.originalPrice && product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return `
      <article class="product-card" data-product-id="${product.id}">
        <a href="/product?id=${product.id}" class="product-card-media">
          <img src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.name)}" loading="lazy" />
          <div class="product-card-badges">
            ${discountPct > 0 ? `<span class="badge badge-accent">-${discountPct}%</span>` : '<span></span>'}
            ${getStockBadgeHtml(product.stock)}
          </div>
        </a>
        <div class="product-card-body">
          <div class="product-category-label">${escapeHtml(product.brand || 'CodeAlpha')} &middot; ${escapeHtml(product.category)}</div>
          <h3 class="product-card-title">
            <a href="/product?id=${product.id}">${escapeHtml(product.name)}</a>
          </h3>
          <div class="product-rating">
            <span class="rating-star">&#9733; ${Number(product.rating).toFixed(1)}</span>
            <span>(${product.reviewCount} reviews)</span>
          </div>
          <div class="product-card-footer">
            <div class="price-group">
              <span class="price-current">${formatPrice(product.price)}</span>
              ${
                product.originalPrice
                  ? `<span class="price-original">${formatPrice(product.originalPrice)}</span>`
                  : ''
              }
            </div>
            <button
              type="button"
              class="btn btn-primary btn-sm add-to-cart-btn"
              data-product-id="${product.id}"
              ${product.stock <= 0 ? 'disabled' : ''}
            >
              ${product.stock <= 0 ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </article>
    `;
  }

  async function addToCartAndSync(productId, quantity = 1, buttonEl = null) {
    const originalText = buttonEl ? buttonEl.textContent : '';
    if (buttonEl) {
      buttonEl.disabled = true;
      buttonEl.textContent = 'Adding...';
    }
    try {
      const res = await cartApi.add(productId, quantity);
      updateCartBadge(res.summary.itemCount);
      showToast(res.message || 'Added to cart!', 'success');
      return res;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    } finally {
      if (buttonEl) {
        buttonEl.disabled = false;
        buttonEl.textContent = originalText;
      }
    }
  }

  // Event delegation for "Add to Cart" buttons on any product grid
  document.addEventListener('click', (event) => {
    const btn = event.target.closest('.add-to-cart-btn');
    if (!btn) return;
    const productId = Number(btn.getAttribute('data-product-id'));
    if (productId) {
      addToCartAndSync(productId, 1, btn).catch(() => {});
    }
  });

  renderHeader();
  renderFooter();
  const readyPromise = syncShellState();

  window.StoreUI = {
    state,
    readyPromise,
    showToast,
    updateCartBadge,
    updateAuthUI,
    syncShellState,
    getStockBadgeHtml,
    renderProductCard,
    addToCartAndSync
  };
})();
