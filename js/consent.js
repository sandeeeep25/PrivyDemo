// Consent PoC logic
const EXTERNAL_TEMPLATE_URL = (window.__APP_CONFIG && window.__APP_CONFIG.PRIVY_TEMPLATE_URL) ? window.__APP_CONFIG.PRIVY_TEMPLATE_URL : '';

function openTemplate() {
  // external resource sets X-Frame-Options, so open in new tab/window
  if (!EXTERNAL_TEMPLATE_URL) {
    alert('Privy template URL not configured. Please set PRIVY_TEMPLATE_URL in js/config.js');
    return;
  }
  window.open(EXTERNAL_TEMPLATE_URL, '_blank', 'noopener');
}

function saveConsentAndRedirect() {
  const privyAccepted = !!document.getElementById('privyAcceptedCheckbox').checked;
  if (!privyAccepted) {
    alert('You must confirm that you accepted the external Privy consent before continuing.');
    return;
  }

  const consent = {
    necessary: true,
    analytics: !!document.getElementById('analyticsCookies').checked,
    marketing: !!document.getElementById('marketingCookies').checked,
    privyAccepted: true,
    timestamp: Date.now()
  };
  try {
    localStorage.setItem('userConsent', JSON.stringify(consent));
  } catch (e) {
    console.warn('Could not save consent in localStorage', e);
  }
  // Redirect to registration page
  window.location.href = 'register.html';
}

function showDeclineWarning() {
  const el = document.getElementById('declineWarning');
  if (el) el.style.display = 'block';
}

function toggleAcceptButton() {
  const checkbox = document.getElementById('privyAcceptedCheckbox');
  const acceptBtn = document.getElementById('acceptConsent');
  if (acceptBtn && checkbox) acceptBtn.disabled = !checkbox.checked;
}

window.addEventListener('load', () => {
  const viewBtn = document.getElementById('viewTemplate');
  if (viewBtn) viewBtn.addEventListener('click', openTemplate);

  const acceptBtn = document.getElementById('acceptConsent');
  if (acceptBtn) acceptBtn.addEventListener('click', saveConsentAndRedirect);

  const declineBtn = document.getElementById('declineConsent');
  if (declineBtn) declineBtn.addEventListener('click', showDeclineWarning);

  const privyCb = document.getElementById('privyAcceptedCheckbox');
  if (privyCb) privyCb.addEventListener('change', toggleAcceptButton);
  toggleAcceptButton();
});
