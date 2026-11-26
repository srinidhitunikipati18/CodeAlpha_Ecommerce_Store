/**
 * Checkout page: auth guard, live stock verification, delivery details,
 * simulated payment selection, and order placement.
 */
(function () {
  const { ordersApi, formatPrice, escapeHtml } = window.StoreAPI;
  const { readyPromise, updateCartBadge, showToast } = window.StoreUI;

  const checkoutRoot = document.getElementById('checkout-root');

  async function initCheckout() {
    const { user } = await readyPromise;

    if (!user) {
      checkoutRoot.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h2>Sign in to complete your order</h2>
          <p>Your cart items are saved and will automatically transfer to your account once you log in or register.</p>
          <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
            <a href="/login?redirect=%2Fcheckout" class="btn btn-primary btn-lg">Login to Continue</a>
            <a href="/register?redirect=%2Fcheckout" class="btn btn-secondary btn-lg">Create Account</a>
          </div>
        </div>
      `;
      return;
    }

    try {
      const preview = await ordersApi.checkoutPreview();

      if (!preview.items || preview.items.length === 0) {
        checkoutRoot.innerHTML = `
          <div class="empty-state">
            <h2>Your cart is empty</h2>
            <p>Add some products to your cart before proceeding to checkout.</p>
            <a href="/shop" class="btn btn-primary btn-lg">Browse Catalog</a>
          </div>
        `;
        return;
      }

      const { summary, stockIssues } = preview;
      const hasStockIssues = stockIssues && stockIssues.length > 0;

      checkoutRoot.innerHTML = `
        <div class="two-col-layout">
          <form class="panel-card" id="checkout-form" novalidate>
            <h2>Shipping &amp; Payment Details</h2>

            <div id="checkout-error-box" class="alert alert-error" style="display:none;"></div>

            ${
              hasStockIssues
                ? `<div class="alert alert-error">
                    Some items in your cart exceed current stock availability. Please
                    <a href="/cart" style="text-decoration:underline; font-weight:700;">update your cart</a>
                    before placing the order.
                   </div>`
                : ''
            }

            <div class="form-group">
              <label for="customerName">Full Name</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                class="form-control"
                value="${escapeHtml(preview.customer.name)}"
                required
                minlength="2"
                maxlength="100"
                placeholder="Enter recipient full name"
              />
            </div>

            <div class="form-group">
              <label for="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                class="form-control"
                required
                placeholder="e.g., +91 98765 43210"
              />
            </div>

            <div class="form-group">
              <label for="deliveryAddress">Delivery Address</label>
              <textarea
                id="deliveryAddress"
                name="deliveryAddress"
                class="form-control"
                rows="3"
                required
                minlength="10"
                maxlength="350"
                placeholder="Flat/House No., Street, Locality, City, State - PIN Code"
              ></textarea>
            </div>

            <div class="form-group" style="margin-top:24px;">
              <label>Simulated Payment Method</label>
              <p style="margin:0 0 10px; font-size:0.84rem; color:var(--text-muted);">
                Demo payment simulation only — no real payment or card information is collected.
              </p>

              <label class="payment-option">
                <input type="radio" name="paymentMethod" value="Cash on Delivery" checked />
                <div>
                  <strong>Cash on Delivery</strong>
                  <div style="font-size:0.83rem; color:var(--text-muted);">Pay upon doorstep delivery.</div>
                </div>
              </label>

              <label class="payment-option">
                <input type="radio" name="paymentMethod" value="Simulated Digital Wallet" />
                <div>
                  <strong>Simulated Digital Wallet</strong>
                  <div style="font-size:0.83rem; color:var(--text-muted);">Instant simulated wallet confirmation.</div>
                </div>
              </label>

              <label class="payment-option">
                <input type="radio" name="paymentMethod" value="Simulated Test Card" />
                <div>
                  <strong>Simulated Test Card</strong>
                  <div style="font-size:0.83rem; color:var(--text-muted);">Demo authorization without card input.</div>
                </div>
              </label>
            </div>

            <button
              type="submit"
              id="place-order-btn"
              class="btn btn-primary btn-lg btn-block"
              ${hasStockIssues ? 'disabled' : ''}
            >
              Place Order &middot; ${formatPrice(summary.totalAmount)}
            </button>
          </form>

          <aside class="panel-card">
            <h2>Order Summary (${summary.itemCount} items)</h2>
            <div class="order-items-mini" style="margin-bottom:16px;">
              ${preview.items
                .map(
                  (item) => `
                <div class="order-item-mini">
                  <div class="order-item-mini-left">
                    <img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.name)}" />
                    <div>
                      <div style="font-weight:700; font-size:0.9rem;">${escapeHtml(item.name)}</div>
                      <div style="font-size:0.8rem; color:var(--text-muted);">Qty: ${item.quantity} &times; ${formatPrice(item.price)}</div>
                    </div>
                  </div>
                  <strong style="font-size:0.92rem;">${formatPrice(item.lineTotal)}</strong>
                </div>
              `
                )
                .join('')}
            </div>

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

            <div style="margin-top:16px;">
              <a href="/cart" class="btn btn-ghost btn-sm btn-block">&larr; Edit Cart</a>
            </div>
          </aside>
        </div>
      `;

      const form = document.getElementById('checkout-form');
      const errorBox = document.getElementById('checkout-error-box');
      const submitBtn = document.getElementById('place-order-btn');

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorBox.style.display = 'none';

        const customerName = document.getElementById('customerName').value.trim();
        const phoneNumber = document.getElementById('phoneNumber').value.trim();
        const deliveryAddress = document.getElementById('deliveryAddress').value.trim();
        const paymentMethod = form.querySelector('input[name="paymentMethod"]:checked')?.value;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing Order...';

        try {
          const res = await ordersApi.placeOrder({
            customerName,
            phoneNumber,
            deliveryAddress,
            paymentMethod
          });
          updateCartBadge(0);
          showToast('Order placed successfully!', 'success');
          window.location.href = `/order-confirmation?order=${encodeURIComponent(
            res.order.orderNumber
          )}`;
        } catch (err) {
          errorBox.textContent = err.message;
          errorBox.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = `Place Order · ${formatPrice(summary.totalAmount)}`;
        }
      });
    } catch (err) {
      checkoutRoot.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
    }
  }

  initCheckout();
})();
