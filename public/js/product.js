/**
 * Individual product detail page: stock availability, quantity selector, specs, and related items.
 */
(function () {
  const { productsApi, formatPrice, escapeHtml } = window.StoreAPI;
  const { addToCartAndSync, renderProductCard, getStockBadgeHtml } = window.StoreUI;

  const root = document.getElementById('product-detail-root');
  const relatedSection = document.getElementById('related-section');
  const relatedGrid = document.getElementById('related-products-grid');

  const productId = new URLSearchParams(window.location.search).get('id');

  async function loadProduct() {
    if (!productId) {
      root.innerHTML = `
        <div class="empty-state">
          <h2>Product Not Specified</h2>
          <p>Select a product from our catalog to inspect its details and availability.</p>
          <a href="/shop" class="btn btn-primary">Go to Shop</a>
        </div>
      `;
      return;
    }

    try {
      const { product, relatedProducts } = await productsApi.get(productId);
      document.title = `${product.name} — CodeAlpha Store`;

      const specsEntries = Object.entries(product.specs || {});
      const outOfStock = product.stock <= 0;
      let selectedQty = 1;

      root.innerHTML = `
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span>/</span>
          <a href="/shop">Shop</a>
          <span>/</span>
          <a href="/shop?category=${encodeURIComponent(product.category)}">${escapeHtml(
            product.category
          )}</a>
          <span>/</span>
          <span>${escapeHtml(product.name)}</span>
        </nav>

        <div class="product-detail-grid">
          <div class="product-gallery">
            <img src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.name)}" />
          </div>

          <div class="product-info-card">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap;">
              <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                <span class="badge badge-accent">${escapeHtml(product.category)}</span>
                <span style="font-size:0.84rem; font-weight:700; color:var(--text-secondary);">Brand: ${escapeHtml(
                  product.brand || 'CodeAlpha'
                )}</span>
              </div>
              ${getStockBadgeHtml(product.stock)}
            </div>

            <h1 class="product-detail-title">${escapeHtml(product.name)}</h1>

            <div class="product-rating">
              <span class="rating-star">&#9733; ${Number(product.rating).toFixed(1)}</span>
              <span>${product.reviewCount} verified reviews</span>
              <span>&middot;</span>
              <span>Product ID #${product.id}</span>
            </div>

            <div class="product-detail-price">
              <span class="price-current">${formatPrice(product.price)}</span>
              ${
                product.originalPrice
                  ? `<span class="price-original">${formatPrice(product.originalPrice)}</span>`
                  : ''
              }
            </div>

            <p class="product-description">${escapeHtml(product.description)}</p>

            <div style="margin-bottom: 18px; font-size: 0.9rem; color: var(--text-secondary);">
              Availability:
              <strong style="color: ${outOfStock ? 'var(--danger)' : 'var(--success)'};">
                ${outOfStock ? 'Currently Out of Stock' : `${product.stock} unit(s) ready to ship`}
              </strong>
            </div>

            <div class="qty-purchase-row">
              <div class="qty-stepper" aria-label="Quantity selector">
                <button type="button" id="qty-dec" ${outOfStock ? 'disabled' : ''}>-</button>
                <span id="qty-val">${outOfStock ? 0 : 1}</span>
                <button type="button" id="qty-inc" ${outOfStock ? 'disabled' : ''}>+</button>
              </div>

              <button
                type="button"
                id="detail-add-btn"
                class="btn btn-primary btn-lg"
                style="flex:1;"
                ${outOfStock ? 'disabled' : ''}
              >
                ${outOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>

              <button
                type="button"
                id="detail-buy-btn"
                class="btn btn-secondary btn-lg"
                ${outOfStock ? 'disabled' : ''}
              >
                Buy Now
              </button>
            </div>

            ${
              specsEntries.length > 0
                ? `
              <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border);">
                <h2 style="font-size: 1rem; margin: 0 0 8px;">Specifications</h2>
                <table class="specs-table">
                  <tbody>
                    ${specsEntries
                      .map(
                        ([key, val]) => `
                      <tr>
                        <th>${escapeHtml(key)}</th>
                        <td>${escapeHtml(val)}</td>
                      </tr>
                    `
                      )
                      .join('')}
                  </tbody>
                </table>
              </div>
            `
                : ''
            }
          </div>
        </div>
      `;

      const decBtn = document.getElementById('qty-dec');
      const incBtn = document.getElementById('qty-inc');
      const qtySpan = document.getElementById('qty-val');
      const addBtn = document.getElementById('detail-add-btn');
      const buyBtn = document.getElementById('detail-buy-btn');

      if (!outOfStock) {
        const updateStepper = () => {
          qtySpan.textContent = String(selectedQty);
          decBtn.disabled = selectedQty <= 1;
          incBtn.disabled = selectedQty >= product.stock;
        };
        updateStepper();

        decBtn.addEventListener('click', () => {
          if (selectedQty > 1) {
            selectedQty -= 1;
            updateStepper();
          }
        });

        incBtn.addEventListener('click', () => {
          if (selectedQty < product.stock) {
            selectedQty += 1;
            updateStepper();
          }
        });

        addBtn.addEventListener('click', () => {
          addToCartAndSync(product.id, selectedQty, addBtn).catch(() => {});
        });

        buyBtn.addEventListener('click', async () => {
          try {
            await addToCartAndSync(product.id, selectedQty, buyBtn);
            window.location.href = '/cart';
          } catch (_) {
            // Toast already shown
          }
        });
      }

      if (relatedProducts && relatedProducts.length > 0) {
        relatedSection.style.display = 'block';
        relatedGrid.innerHTML = relatedProducts.map(renderProductCard).join('');
      }
    } catch (err) {
      root.innerHTML = `
        <div class="empty-state">
          <h2>Product Not Found</h2>
          <p>${escapeHtml(err.message)}</p>
          <a href="/shop" class="btn btn-primary">Back to Catalog</a>
        </div>
      `;
    }
  }

  loadProduct();
})();
