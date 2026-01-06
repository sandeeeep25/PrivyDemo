// Consent PoC logic
const EXTERNAL_TEMPLATE_URL = "https://privy.idfy.com/principal/notice/04c6d7e7-b4b5-42cd-9310-c9d8dfd5dae9/view/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhX2ZpZHVjaWFyeV9pZCI6IjhkMDljYzVlZWFjMyIsImRhdGFfcHJpbmNpcGFsX2lkIjoiZTExYzZkOGEtMWY1Mi00M2QxLTlmOGEtNWY1ZDg1OWVkMWQ5IiwiZXhwIjoxNzY4NDc2NDMzLCJvdV9pZCI6IjhkMDljYzVlZWFjMyIsInB1YmxpY19pZCI6IjA0YzZkN2U3LWI0YjUtNDJjZC05MzEwLWM5ZDhkZmQ1ZGFlOSIsInJlZmVyZW5jZV9pZCI6IjEzMTMiLCJhdWQiOiJKb2tlbiIsImV4cCI6MTc2NzYxOTAzMywiaWF0IjoxNzY3NjExODMzLCJpc3MiOiJKb2tlbiIsImp0aSI6IjMyM3QzNjd0N2E5MTRlZW5iYzAyNm90MSIsIm5iZiI6MTc2NzYxMTgzM30.fQQLxgXVLa5xHV7ocaqnt3IXwarc4KrHfWfQEf_r2Yo";

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
