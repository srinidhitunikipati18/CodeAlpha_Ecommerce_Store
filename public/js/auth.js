/**
 * Login & Register form handling with safe relative redirect preservation.
 */
(function () {
  const { authApi } = window.StoreAPI;
  const { readyPromise, showToast } = window.StoreUI;

  const rawRedirect = new URLSearchParams(window.location.search).get('redirect') || '/';
  const safeRedirect =
    rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/';

  const errorBox = document.getElementById('auth-error-box');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  // Preserve redirect param across login <-> register switch links
  const switchToReg = document.getElementById('switch-to-register');
  if (switchToReg && safeRedirect !== '/') {
    switchToReg.href = `/register?redirect=${encodeURIComponent(safeRedirect)}`;
  }
  const switchToLogin = document.getElementById('switch-to-login');
  if (switchToLogin && safeRedirect !== '/') {
    switchToLogin.href = `/login?redirect=${encodeURIComponent(safeRedirect)}`;
  }

  function showError(msg) {
    if (!errorBox) return;
    errorBox.textContent = msg;
    errorBox.style.display = 'block';
  }

  readyPromise.then(({ user }) => {
    if (user) {
      window.location.href = safeRedirect;
    }
  });

  if (loginForm) {
    const submitBtn = document.getElementById('login-submit-btn');
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorBox.style.display = 'none';

      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      if (!email || !password) {
        showError('Please enter your email and password.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing in...';

      try {
        await authApi.login({ email, password });
        showToast('Logged in successfully!', 'success');
        window.location.href = safeRedirect;
      } catch (err) {
        showError(err.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
      }
    });
  }

  if (registerForm) {
    const submitBtn = document.getElementById('register-submit-btn');
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorBox.style.display = 'none';

      const name = document.getElementById('register-name').value.trim();
      const email = document.getElementById('register-email').value.trim();
      const password = document.getElementById('register-password').value;
      const confirmPassword = document.getElementById('register-confirm-password').value;

      if (name.length < 2) {
        showError('Full name must be at least 2 characters.');
        return;
      }
      if (password.length < 6) {
        showError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        showError('Passwords do not match.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating account...';

      try {
        await authApi.register({ name, email, password });
        showToast('Account created successfully!', 'success');
        window.location.href = safeRedirect;
      } catch (err) {
        showError(err.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
      }
    });
  }
})();
