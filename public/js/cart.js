/**
 * Shopping cart page: quantity updates, item removal, totals, and empty-cart state.
 */
(function () {
  const { cartApi, formatPrice, escapeHtml } = window.StoreAPI;
  const { updateCartBadge, showToast } = window.StoreUI;

  const cartRoot = document.getElementById('cart-root');
  const errorBox = document.getElementById('cart-error-box');

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.style.display = 'block';
  }

  function clearError() {
    errorBox.style.display = 'none';
  }

  function renderEmptyCart() {
    cartRoot.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </div>
        <h2>Your shopping cart is empty</h2>
        <p>Looks like you haven't added anything yet. Explore our latest electronics, desk gear, and lifestyle drops.</p>
        <a href="/shop" class="btn btn-primary btn-lg">Start Shopping</a>
      </div>
    `;
  }

  function renderCart(cart) {
    updateCartBadge(cart.summary.itemCount);

    if (!cart.items || cart.items.length === 0) {
      renderEmptyCart();
      return;
    }

    const { summary } = cart;
    const freeShippingMsg =
      summary.amountToFreeShipping > 0
        ? `Add ${formatPrice(summary.amountToFreeShipping)} more to unlock Free Express Shipping!`
        : 'You have unlocked Free Express Shipping!';

    cartRoot.innerHTML = `
      <div class="two-col-layout">
        <div class="panel-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <h2 style="margin:0;">Cart Items (${summary.itemCount})</h2>
            <button type="button" id="clear-cart-btn" class="btn btn-ghost btn-sm" style="color:var(--danger);">
              Clear Cart
            </button>
          </div>

          <div id="cart-items-list">
            ${cart.items
              .map(
                (item) => `
              <div class="cart-item-row" data-product-id="${item.productId}">
                <a href="/product?id=${item.productId}">
                  <img class="cart-item-thumb" src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.name)}" />
                </a>

                <div class="cart-item-meta">
                  <h3><a href="/product?id=${item.productId}">${escapeHtml(item.name)}</a></h3>
                  <p>${escapeHtml(item.category)} &middot; ${formatPrice(item.price)} each</p>
                  ${
                    item.stock <= 0
                      ? '<span class="badge badge-danger">Out of Stock — please remove</span>'
                      : item.exceedsStock
                      ? `<span class="badge badge-warning">Only ${item.stock} available in stock</span>`
                      : `<span class="badge badge-success">${item.stock} in stock</span>`
                  }
                </div>

                <div class="cart-item-actions">
                  <strong style="font-size:1.05rem;">${formatPrice(item.lineTotal)}</strong>
                  <div style="display:flex; align-items:center; gap:10px;">
                    <div class="qty-stepper">
                      <button type="button" class="cart-qty-dec" data-product-id="${item.productId}" data-qty="${item.quantity}">-</button>
                      <span>${item.quantity}</span>
                      <button
                        type="button"
                        class="cart-qty-inc"
                        data-product-id="${item.productId}"
                        data-qty="${item.quantity}"
                        ${item.quantity >= item.stock ? 'disabled' : ''}
                      >+</button>
                    </div>
                    <button
                      type="button"
                      class="btn btn-danger-outline btn-sm cart-remove-btn"
                      data-product-id="${item.productId}"
                      aria-label="Remove ${escapeHtml(item.name)}"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>

        <aside class="panel-card">
          <h2>Order Summary</h2>
          <div class="shipping-progress">${freeShippingMsg}</div>

          <div class="summary-row">
            <span>Subtotal</span>
            <span>${formatPrice(summary.subtotal)}</span>
          </div>
          <div class="summary-row">
            <span>Shipping</span>
            <span>${summary.shippingFee === 0 ? 'Free' : formatPrice(summary.shippingFee)}</span>
          </div>
          <div class="summary-row">
            <span>Estimated GST (18%)</span>
            <span>${formatPrice(summary.taxAmount)}</span>
          </div>
          <div class="summary-row total">
            <span>Total</span>
            <span>${formatPrice(summary.totalAmount)}</span>
          </div>

          <div style="margin-top:20px; display:grid; gap:10px;">
            <a href="/checkout" class="btn btn-primary btn-lg btn-block">Proceed to Checkout</a>
            <a href="/shop" class="btn btn-secondary btn-block">Continue Shopping</a>
          </div>
        </aside>
      </div>
    `;

    bindCartActions();
  }

  function bindCartActions() {
    const clearBtn = document.getElementById('clear-cart-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', async () => {
        clearError();
        try {
          const res = await cartApi.clear();
          renderCart(res);
          showToast('Cart cleared.', 'success');
        } catch (err) {
          showError(err.message);
        }
      });
    }

    document.querySelectorAll('.cart-qty-dec').forEach((btn) => {
      btn.addEventListener('click', async () => {
        clearError();
        const productId = Number(btn.getAttribute('data-product-id'));
        const currentQty = Number(btn.getAttribute('data-qty'));
        try {
          const res = await cartApi.update(productId, currentQty - 1);
          renderCart(res);
        } catch (err) {
          showError(err.message);
          showToast(err.message, 'error');
        }
      });
    });

    document.querySelectorAll('.cart-qty-inc').forEach((btn) => {
      btn.addEventListener('click', async () => {
        clearError();
        const productId = Number(btn.getAttribute('data-product-id'));
        const currentQty = Number(btn.getAttribute('data-qty'));
        try {
          const res = await cartApi.update(productId, currentQty + 1);
          renderCart(res);
        } catch (err) {
          showError(err.message);
          showToast(err.message, 'error');
        }
      });
    });

    document.querySelectorAll('.cart-remove-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        clearError();
        const productId = Number(btn.getAttribute('data-product-id'));
        try {
          const res = await cartApi.remove(productId);
          renderCart(res);
          showToast('Item removed from cart.', 'success');
        } catch (err) {
          showError(err.message);
        }
      });
    });
  }

  async function loadCart() {
    try {
      const cart = await cartApi.get();
      renderCart(cart);
    } catch (err) {
      showError(err.message);
      cartRoot.innerHTML = '';
    }
  }

  loadCart();
})();
