document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
    };

    const base = window.__APP_CONFIG && window.__APP_CONFIG.API_BASE;
    const key = window.__APP_CONFIG && window.__APP_CONFIG.FUNCTION_KEY;
    if (!base || !key) {
        alert('Configuration missing: API_BASE and FUNCTION_KEY must be set in js/config.js');
        return;
    }
    const url = `${base}/api/newLogin?code=${key}`;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    console.log('Login response status:', response);
    const contentType = response.headers.get('content-type') || '';
    let result;
    if (contentType.includes('application/json')) {
        try { result = await response.json(); } catch (_) { result = null; }
    } else {
        try { result = await response.text(); } catch (_) { result = null; }
    }

    if (response.ok) {
        alert("Login successful!" , result && result.userId, response);
        console.log('Login result:', result);
        console.log('Storing userId in localStorage:', result.userId);
        if (result && result.userId) localStorage.setItem("userId", result.userId);
        window.location.href = "home.html";
    } else {
        const message = (result && result.message) ? result.message : (typeof result === 'string' ? result : JSON.stringify(result));
        alert("Error: " + message);
    }
});


// ============================
// NEW: REGISTER → CONSENT FLOW
// ============================

document.getElementById("registerBtn")?.addEventListener("click", async (e) => {
    e.preventDefault();

    const base = window.__APP_CONFIG.API_BASE;
    const key = window.__APP_CONFIG.FUNCTION_KEY;

    // 1️⃣ Generate UUID (Data Principal ID)
    const dataPrincipalId = crypto.randomUUID();
    const referenceId = "web-reg-" + Date.now();

    // Store for later (after consent)
    localStorage.setItem("pendingConsentUserId", dataPrincipalId);

    // 2️⃣ Call Azure Function
    const response = await fetch(`${base}/api/generateConsent?code=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            referenceId,
            dataPrincipalId
        })
    });

    const result = await response.json();

    if (!response.ok) {
        alert("Failed to generate consent");
        return;
    }

    // 3️⃣ Open consent popup
    openConsentPopup(result.embedLink);
});


// ============================
// CONSENT POPUP FUNCTION
// ============================

function openConsentPopup(embedLink) {
    const modal = document.createElement("div");
    modal.id = "consentModal";

    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.background = "rgba(0,0,0,0.6)";
    modal.style.zIndex = "9999";

    modal.innerHTML = `
        <div style="
            width: 80%;
            height: 80%;
            margin: 5% auto;
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            position: relative;
        ">
            <iframe
                src="${embedLink}"
                style="width:100%;height:100%;border:none;">
            </iframe>
        </div>
    `;

    document.body.appendChild(modal);
}
