// window.addEventListener("load", async () => {
//     const userId = localStorage.getItem("userId");
//     if (!userId) {
//         window.location.href = "login.html";
//         return;
//     }

//     const base = window.__APP_CONFIG && window.__APP_CONFIG.API_BASE;
//     const key = window.__APP_CONFIG && window.__APP_CONFIG.FUNCTION_KEY;
//     if (!base || !key) {
//         console.warn('Configuration missing: API_BASE or FUNCTION_KEY not set. Skipping getConsent call.');
//         return;
//     }

//     const url = `${base}/api/getConsent?code=${key}&userId=${userId}`;
//     const response = await fetch(url);
//     if (response.ok) {
//         const consent = await response.json();
//         console.log("User Consent:", consent);
//         // Show cookie banner or preferences based on consent
//     }
// });
