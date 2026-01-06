function setTestCookie() {
  document.cookie = "privy_test_cookie=allowed; path=/;";
  document.getElementById("cookieStatus").innerText =
    "Cookie has been set.";
}

function readTestCookie() {
  if (document.cookie.includes("privy_test_cookie")) {
    document.getElementById("cookieStatus").innerText =
      "Cookie exists: " + document.cookie;
  } else {
    document.getElementById("cookieStatus").innerText =
      "Cookie not found.";
  }
}

function deleteTestCookie() {
  document.cookie =
    "privy_test_cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.getElementById("cookieStatus").innerText =
    "Cookie has been deleted.";
}
window.onload = function () {
  if (localStorage.getItem("cookieConsent")) {
    document.getElementById("cookieConsent").style.display = "none";
  }
};

function acceptAllCookies() {
  localStorage.setItem("cookieConsent", JSON.stringify({
    necessary: true,
    analytics: true,
    marketing: true
  }));
  closeConsent();
}

function rejectNonEssential() {
  localStorage.setItem("cookieConsent", JSON.stringify({
    necessary: true,
    analytics: false,
    marketing: false
  }));
  closeConsent();
}

function savePreferences() {
  const analytics = document.getElementById("analyticsCookies").checked;
  const marketing = document.getElementById("marketingCookies").checked;

  localStorage.setItem("cookieConsent", JSON.stringify({
    necessary: true,
    analytics: analytics,
    marketing: marketing
  }));
  closeConsent();
}

function closeConsent() {
  document.getElementById("cookieConsent").style.display = "none";
}
