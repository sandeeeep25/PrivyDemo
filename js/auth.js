// Auth helper: shows login/logout links and performs logout cleanup
function logout() {
  try {
    localStorage.removeItem("userId");
    localStorage.removeItem("cookieConsent");
  } catch (e) {
    console.warn("Could not clear localStorage during logout", e);
  }

  // delete test cookie if present
  document.cookie = "privy_test_cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  // redirect to login page
  window.location.href = "login.html";
}

function showAuthLinks() {
  const container = document.getElementById("authLinks");
  if (!container) return;

  const userId = (() => {
    try { return localStorage.getItem("userId"); } catch (e) { return null; }
  })();

  if (userId) {
    container.innerHTML = '<a href="#" id="logoutLink">Logout</a>';
    const link = document.getElementById("logoutLink");
    if (link) link.addEventListener("click", (e) => { e.preventDefault(); logout(); });
  } else {
    container.innerHTML = '<a href="login.html">Login</a>';
  }
}

window.addEventListener("load", showAuthLinks);

// make sure config.js is loaded optionally
if (!(window.__APP_CONFIG)) {
  // no-op; config is optional. If you run `npm run build-config` it will create js/config.js
}
