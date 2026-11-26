/**
 * Shared REST API client and formatting utilities for CodeAlpha Store.
 */
async function apiRequest(url, options = {}) {
  const config = {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  };

  if (config.body && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  let data = null;
  try {
    data = await response.json();
  } catch (_) {
    data = null;
  }

  if (!response.ok) {
    const error = new Error((data && data.error) || `Request failed (${response.status})`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

function formatPrice(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const authApi = {
  me: () => apiRequest('/api/auth/me', { method: 'GET' }),
  login: (payload) => apiRequest('/api/auth/login', { method: 'POST', body: payload }),
  register: (payload) => apiRequest('/api/auth/register', { method: 'POST', body: payload }),
  logout: () => apiRequest('/api/auth/logout', { method: 'POST' })
};

const productsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        qs.set(key, val);
      }
    });
    const queryStr = qs.toString();
    return apiRequest(`/api/products${queryStr ? `?${queryStr}` : ''}`, { method: 'GET' });
  },
  categories: () => apiRequest('/api/products/categories', { method: 'GET' }),
  get: (id) => apiRequest(`/api/products/${encodeURIComponent(id)}`, { method: 'GET' })
};

const cartApi = {
  get: () => apiRequest('/api/cart', { method: 'GET' }),
  add: (productId, quantity = 1) =>
    apiRequest('/api/cart', { method: 'POST', body: { productId, quantity } }),
  update: (productId, quantity) =>
    apiRequest(`/api/cart/${encodeURIComponent(productId)}`, {
      method: 'PUT',
      body: { quantity }
    }),
  remove: (productId) =>
    apiRequest(`/api/cart/${encodeURIComponent(productId)}`, { method: 'DELETE' }),
  clear: () => apiRequest('/api/cart', { method: 'DELETE' })
};

const ordersApi = {
  checkoutPreview: () => apiRequest('/api/checkout', { method: 'GET' }),
  placeOrder: (payload) => apiRequest('/api/orders', { method: 'POST', body: payload }),
  list: () => apiRequest('/api/orders', { method: 'GET' }),
  get: (orderId) => apiRequest(`/api/orders/${encodeURIComponent(orderId)}`, { method: 'GET' })
};

const newsletterApi = {
  subscribe: (email) => apiRequest('/api/newsletter', { method: 'POST', body: { email } })
};

window.StoreAPI = {
  apiRequest,
  formatPrice,
  escapeHtml,
  authApi,
  productsApi,
  cartApi,
  ordersApi,
  newsletterApi
};
