/**
 * Shop catalog page: search, category filtering, sorting, URL sync, and Load More pagination.
 */
(function () {
  const { productsApi, escapeHtml } = window.StoreAPI;
  const { renderProductCard } = window.StoreUI;

  const PAGE_SIZE = 24;
  const urlParams = new URLSearchParams(window.location.search);
  const filterState = {
    category: urlParams.get('category') || 'all',
    search: urlParams.get('search') || '',
    sort: urlParams.get('sort') || 'featured',
    page: 1,
    loadedCount: 0
  };

  const pillsContainer = document.getElementById('category-filter-pills');
  const searchInput = document.getElementById('shop-search-input');
  const sortSelect = document.getElementById('shop-sort-select');
  const resultsCount = document.getElementById('shop-results-count');
  const resetBtn = document.getElementById('shop-reset-btn');
  const errorBox = document.getElementById('shop-error-box');
  const grid = document.getElementById('shop-products-grid');
  const loadMoreWrap = document.getElementById('shop-load-more-wrap');
  const loadMoreBtn = document.getElementById('shop-load-more-btn');

  if (searchInput) searchInput.value = filterState.search;
  if (sortSelect) sortSelect.value = filterState.sort;

  function syncUrlParams() {
    const nextParams = new URLSearchParams();
    if (filterState.category && filterState.category !== 'all') {
      nextParams.set('category', filterState.category);
    }
    if (filterState.search) {
      nextParams.set('search', filterState.search);
    }
    if (filterState.sort && filterState.sort !== 'featured') {
      nextParams.set('sort', filterState.sort);
    }
    const qs = nextParams.toString();
    const newUrl = qs ? `/shop?${qs}` : '/shop';
    window.history.replaceState({}, '', newUrl);
  }

  function renderCategoryPills(categories) {
    if (!pillsContainer) return;
    const allBtn = `<button type="button" class="pill-btn ${
      filterState.category.toLowerCase() === 'all' ? 'active' : ''
    }" data-category="all">All</button>`;

    const catBtns = categories
      .map(
        (cat) => `
        <button type="button" class="pill-btn ${
          filterState.category.toLowerCase() === cat.name.toLowerCase() ? 'active' : ''
        }" data-category="${escapeHtml(cat.name)}">
          ${escapeHtml(cat.name)} (${cat.count})
        </button>
      `
      )
      .join('');

    pillsContainer.innerHTML = allBtn + catBtns;
  }

  async function fetchAndRenderProducts(append = false) {
    errorBox.style.display = 'none';

    if (!append) {
      filterState.page = 1;
      filterState.loadedCount = 0;
      if (loadMoreWrap) loadMoreWrap.style.display = 'none';
      grid.innerHTML = `
        <div class="loading-state" style="grid-column: 1 / -1;">
          <div class="spinner"></div>
          <span>Loading matching products...</span>
        </div>
      `;
    } else if (loadMoreBtn) {
      loadMoreBtn.disabled = true;
      loadMoreBtn.textContent = 'Loading...';
    }

    const hasActiveFilter =
      filterState.category !== 'all' || filterState.search !== '' || filterState.sort !== 'featured';
    resetBtn.style.display = hasActiveFilter ? 'inline-flex' : 'none';

    try {
      const res = await productsApi.list({
        category: filterState.category,
        search: filterState.search,
        sort: filterState.sort,
        page: filterState.page,
        limit: PAGE_SIZE
      });

      if (!append) {
        renderCategoryPills(res.categories || []);
      }

      if (res.total === 0) {
        resultsCount.textContent = `Showing 0 products${
          filterState.search ? ` for "${filterState.search}"` : ''
        }`;
        grid.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <h3>No products matched your filters</h3>
            <p>Try clearing your search term or switching back to all categories.</p>
            <button type="button" class="btn btn-primary" id="empty-reset-btn">Show All Products</button>
          </div>
        `;
        const emptyReset = document.getElementById('empty-reset-btn');
        if (emptyReset) emptyReset.addEventListener('click', resetFilters);
        if (loadMoreWrap) loadMoreWrap.style.display = 'none';
        return;
      }

      const cardsHtml = res.products.map(renderProductCard).join('');
      if (append) {
        grid.insertAdjacentHTML('beforeend', cardsHtml);
      } else {
        grid.innerHTML = cardsHtml;
      }

      filterState.loadedCount += res.products.length;
      resultsCount.textContent = `Showing ${filterState.loadedCount} of ${res.total} product${
        res.total === 1 ? '' : 's'
      }${filterState.search ? ` for "${filterState.search}"` : ''}`;

      if (loadMoreWrap && loadMoreBtn) {
        if (res.hasMore) {
          loadMoreWrap.style.display = 'block';
          loadMoreBtn.disabled = false;
          loadMoreBtn.textContent = `Load More Products (${res.total - filterState.loadedCount} remaining)`;
        } else {
          loadMoreWrap.style.display = 'none';
        }
      }
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.style.display = 'block';
      if (!append) grid.innerHTML = '';
      if (loadMoreBtn) {
        loadMoreBtn.disabled = false;
        loadMoreBtn.textContent = 'Load More Products';
      }
    }
  }

  function resetFilters() {
    filterState.category = 'all';
    filterState.search = '';
    filterState.sort = 'featured';
    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'featured';
    syncUrlParams();
    fetchAndRenderProducts(false);
  }

  if (pillsContainer) {
    pillsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      filterState.category = btn.getAttribute('data-category') || 'all';
      syncUrlParams();
      fetchAndRenderProducts(false);
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      filterState.sort = sortSelect.value;
      syncUrlParams();
      fetchAndRenderProducts(false);
    });
  }

  let searchTimer = null;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        filterState.search = searchInput.value.trim();
        syncUrlParams();
        fetchAndRenderProducts(false);
      }, 260);
    });
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      filterState.page += 1;
      fetchAndRenderProducts(true);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', resetFilters);
  }

  fetchAndRenderProducts(false);
})();
