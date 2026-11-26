/**
 * Homepage data loader: categories, featured products, trending products, and newsletter.
 */
(function () {
  const { productsApi, newsletterApi, escapeHtml } = window.StoreAPI;
  const { renderProductCard, showToast } = window.StoreUI;

  const CATEGORY_ICONS = {
    Electronics: '🎧',
    Mobiles: '📱',
    Laptops: '💻',
    "Men's Fashion": '👔',
    "Women's Fashion": '👗',
    Footwear: '👟',
    'Home & Kitchen': '🍳',
    'Beauty & Personal Care': '✨',
    Books: '📚',
    Accessories: '⌚',
    'Sports & Fitness': '🏋️',
    'Toys & Games': '🎮'
  };

  async function loadHomepageData() {
    const categoriesGrid = document.getElementById('categories-grid');
    const featuredGrid = document.getElementById('featured-grid');
    const trendingGrid = document.getElementById('trending-grid');

    try {
      const [categoriesRes, featuredRes, trendingRes] = await Promise.all([
        productsApi.categories(),
        productsApi.list({ featured: '1' }),
        productsApi.list({ trending: '1' })
      ]);

      if (categoriesGrid) {
        categoriesGrid.innerHTML = categoriesRes.categories
          .map(
            (cat) => `
            <a href="/shop?category=${encodeURIComponent(cat.name)}" class="category-card">
              <div class="category-icon">${CATEGORY_ICONS[cat.name] || '🛍️'}</div>
              <h3>${escapeHtml(cat.name)}</h3>
              <span>${cat.count} product${cat.count === 1 ? '' : 's'}</span>
            </a>
          `
          )
          .join('');
      }

      if (featuredGrid) {
        const featured = featuredRes.products.slice(0, 8);
        featuredGrid.innerHTML =
          featured.length > 0
            ? featured.map(renderProductCard).join('')
            : '<p>No featured products found.</p>';
      }

      if (trendingGrid) {
        const trending = trendingRes.products.slice(0, 8);
        trendingGrid.innerHTML =
          trending.length > 0
            ? trending.map(renderProductCard).join('')
            : '<p>No trending products found.</p>';
      }
    } catch (err) {
      const errorHtml = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
      if (categoriesGrid) categoriesGrid.innerHTML = errorHtml;
      if (featuredGrid) featuredGrid.innerHTML = errorHtml;
      if (trendingGrid) trendingGrid.innerHTML = errorHtml;
    }
  }

  function setupNewsletter() {
    const form = document.getElementById('newsletter-form');
    const emailInput = document.getElementById('newsletter-email');
    const feedback = document.getElementById('newsletter-feedback');
    const btn = document.getElementById('newsletter-btn');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      if (!email) return;

      btn.disabled = true;
      btn.textContent = 'Subscribing...';
      feedback.textContent = '';

      try {
        const res = await newsletterApi.subscribe(email);
        feedback.style.color = '#a7f3d0';
        feedback.textContent = res.message;
        emailInput.value = '';
        showToast('Subscribed to newsletter!', 'success');
      } catch (err) {
        feedback.style.color = '#fecdd3';
        feedback.textContent = err.message;
      } finally {
        btn.disabled = false;
        btn.textContent = 'Subscribe';
      }
    });
  }

  loadHomepageData();
  setupNewsletter();
})();
