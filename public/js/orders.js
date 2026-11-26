/**
 * Handles both Order Confirmation (/order-confirmation) and Order History (/orders).
 */
(function () {
  const { ordersApi, formatPrice, escapeHtml } = window.StoreAPI;
  const { readyPromise } = window.StoreUI;

  const confirmationRoot = document.getElementById('order-confirmation-root');
  const historyRoot = document.getElementById('orders-history-root');

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr.replace(' ', 'T') + (dateStr.includes('Z') ? '' : 'Z'));
    return Number.isNaN(date.getTime())
      ? dateStr
      : date.toLocaleString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
  }

  function renderOrderItems(items) {
    return items
      .map(
        (item) => `
        <div class="order-item-mini">
          <div class="order-item-mini-left">
            <img src="${escapeHtml(item.productImage)}" alt="${escapeHtml(item.productName)}" />
            <div>
              <div style="font-weight:700; font-size:0.92rem;">
                <a href="/product?id=${item.productId}">${escapeHtml(item.productName)}</a>
              </div>
              <div style="font-size:0.82rem; color:var(--text-muted);">
                Qty: ${item.quantity} &times; ${formatPrice(item.unitPrice)}
              </div>
            </div>
          </div>
          <strong>${formatPrice(item.lineTotal)}</strong>
        </div>
      `
      )
      .join('');
  }

  async function initConfirmation() {
    const { user } = await readyPromise;
    if (!user) {
      window.location.href = `/login?redirect=${encodeURIComponent(
        window.location.pathname + window.location.search
      )}`;
      return;
    }

    const orderParam = new URLSearchParams(window.location.search).get('order');
    if (!orderParam) {
      confirmationRoot.innerHTML = `
        <div class="empty-state">
          <h2>No Order Specified</h2>
          <p>View your past purchases in your order history.</p>
          <a href="/orders" class="btn btn-primary">Go to Order History</a>
        </div>
      `;
      return;
    }

    try {
      const { order } = await ordersApi.get(orderParam);
      confirmationRoot.innerHTML = `
        <div class="confirmation-box">
          <div style="text-align:center; margin-bottom:28px;">
            <div class="confirmation-icon">&#10003;</div>
            <span class="badge badge-success">${escapeHtml(order.status)}</span>
            <h1 style="margin:12px 0 6px; font-size:1.8rem;">Thank You for Your Order!</h1>
            <p style="margin:0; color:var(--text-secondary);">
              Your order <strong>${escapeHtml(order.orderNumber)}</strong> has been confirmed.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; background:var(--bg-page); padding:18px; border-radius:var(--radius-md); margin-bottom:24px;">
            <div>
              <div style="font-size:0.78rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Order ID</div>
              <div style="font-weight:700;">${escapeHtml(order.orderNumber)}</div>
            </div>
            <div>
              <div style="font-size:0.78rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Placed On</div>
              <div style="font-weight:600;">${escapeHtml(formatDate(order.createdAt))}</div>
            </div>
            <div>
              <div style="font-size:0.78rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Payment Method</div>
              <div style="font-weight:600;">${escapeHtml(order.paymentMethod)}</div>
            </div>
          </div>

          <div style="margin-bottom:24px;">
            <h3 style="margin:0 0 8px; font-size:1rem;">Delivery Details</h3>
            <p style="margin:0; color:var(--text-secondary); font-size:0.92rem;">
              <strong>${escapeHtml(order.customerName)}</strong> &middot; ${escapeHtml(order.phoneNumber)}<br />
              ${escapeHtml(order.deliveryAddress)}
            </p>
          </div>

          <div style="margin-bottom:20px;">
            <h3 style="margin:0 0 12px; font-size:1rem;">Items Ordered</h3>
            <div class="order-items-mini">${renderOrderItems(order.items)}</div>
          </div>

          <div style="border-top:1px solid var(--border); padding-top:14px;">
            <div class="summary-row"><span>Subtotal</span><span>${formatPrice(order.subtotal)}</span></div>
            <div class="summary-row"><span>Shipping</span><span>${order.shippingFee === 0 ? 'Free' : formatPrice(order.shippingFee)}</span></div>
            <div class="summary-row"><span>GST (18%)</span><span>${formatPrice(order.taxAmount)}</span></div>
            <div class="summary-row total"><span>Total Paid</span><span>${formatPrice(order.totalAmount)}</span></div>
          </div>

          <div style="display:flex; flex-wrap:wrap; gap:12px; margin-top:26px;">
            <a href="/orders" class="btn btn-primary" style="flex:1;">View Order History</a>
            <a href="/shop" class="btn btn-secondary" style="flex:1;">Continue Shopping</a>
          </div>
        </div>
      `;
    } catch (err) {
      confirmationRoot.innerHTML = `
        <div class="empty-state">
          <h2>Order Not Found</h2>
          <p>${escapeHtml(err.message)}</p>
          <a href="/orders" class="btn btn-primary">View My Orders</a>
        </div>
      `;
    }
  }

  async function initHistory() {
    const { user } = await readyPromise;
    if (!user) {
      historyRoot.innerHTML = `
        <div class="empty-state">
          <h2>Login Required</h2>
          <p>Order history is protected. Sign in to view your previous purchases.</p>
          <a href="/login?redirect=%2Forders" class="btn btn-primary btn-lg">Login to View Orders</a>
        </div>
      `;
      return;
    }

    try {
      const { orders } = await ordersApi.list();

      if (!orders || orders.length === 0) {
        historyRoot.innerHTML = `
          <div class="empty-state">
            <h2>No Orders Yet</h2>
            <p>You haven't placed any orders yet. Explore our catalog to place your first order.</p>
            <a href="/shop" class="btn btn-primary btn-lg">Browse Products</a>
          </div>
        `;
        return;
      }

      historyRoot.innerHTML = orders
        .map(
          (order) => `
          <article class="order-card">
            <div class="order-card-header">
              <div>
                <div style="font-weight:800; font-size:1.05rem;">Order ${escapeHtml(order.orderNumber)}</div>
                <div style="font-size:0.84rem; color:var(--text-muted);">
                  Placed on ${escapeHtml(formatDate(order.createdAt))} &middot; ${escapeHtml(order.paymentMethod)}
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:12px;">
                <span class="badge badge-success">${escapeHtml(order.status)}</span>
                <strong style="font-size:1.1rem;">${formatPrice(order.totalAmount)}</strong>
              </div>
            </div>

            <div class="order-items-mini" style="margin-bottom:14px;">
              ${renderOrderItems(order.items)}
            </div>

            <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:10px; padding-top:12px; border-top:1px solid var(--border); font-size:0.86rem; color:var(--text-secondary);">
              <span>Deliver to: <strong>${escapeHtml(order.customerName)}</strong>, ${escapeHtml(order.deliveryAddress)}</span>
              <a href="/order-confirmation?order=${encodeURIComponent(order.orderNumber)}" class="btn btn-secondary btn-sm">
                View Receipt
              </a>
            </div>
          </article>
        `
        )
        .join('');
    } catch (err) {
      historyRoot.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
    }
  }

  if (confirmationRoot) initConfirmation();
  if (historyRoot) initHistory();
})();
