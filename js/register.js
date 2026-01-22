// document.getElementById("registerForm").addEventListener("submit", async (e) => {
//     e.preventDefault();

//     try {
//         const password = document.getElementById("password").value; // plain-text for PoC

//         const data = {
//             username: document.getElementById("username").value,
//             password: password,
//             email: document.getElementById("email").value,
//             name: document.getElementById("name").value,
//             phone: document.getElementById("phone").value,
//             // analytics: document.getElementById("analyticsCookies").checked ? 1 : 0,
//             // marketing: document.getElementById("marketingCookies").checked ? 1 : 0
//         };

//         const base = window.__APP_CONFIG && window.__APP_CONFIG.API_BASE;
//         const key = window.__APP_CONFIG && window.__APP_CONFIG.FUNCTION_KEY;
//         if (!base || !key) {
//             alert('Configuration missing: API_BASE and FUNCTION_KEY must be set in js/config.js');
//             return;
//         }

//         const url = `${base}/api/test?code=${key}`;

//         const response = await fetch(url, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(data)
//         });

//         const contentType = response.headers.get('content-type') || '';
//         let result;
//         if (contentType.includes('application/json')) {
//             try { result = await response.json(); } catch (_) { result = null; }
//         } else {
//             try { result = await response.text(); } catch (_) { result = null; }
//         }

//         if (response.ok) {
//             alert("Registered successfully!");
//             window.location.href = "login.html";
//         } else {
//             console.error('Registration failed', response.status, result);
//             const message = (result && result.message) ? result.message : (typeof result === 'string' ? result : JSON.stringify(result));
//             alert("Error: " + message);
//         }
//     } catch (err) {
//         console.error('Network or JS error during registration', err);
//         alert('Registration failed: ' + (err && err.message ? err.message : String(err)));
//     }
// });


document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const base = window.__APP_CONFIG.API_BASE;
    const key = window.__APP_CONFIG.FUNCTION_KEY;

    const userData = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
        email: document.getElementById("email").value,
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value
    };

    // 1️⃣ Register user FIRST
    const regResponse = await fetch(`${base}/api/test?code=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
    });

    const regResult = await regResponse.json();

    if (!regResponse.ok) {
        alert("Registration failed");
        return;
    }

    const { userId, dataPrincipalId } = regResult;

    // 2️⃣ Generate consent
    const consentResponse = await fetch(`${base}/api/generateConsent?code=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            referenceId: "web-reg-" + userId,
            dataPrincipalId,
            userId
        })
    });

    const consentResult = await consentResponse.json();

    if (!consentResponse.ok) {
        alert("Failed to generate consent");
        return;
    }

    // 3️⃣ Open Privy popup
    openConsentPopup(consentResult.embedLink);
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

// ============================
// PRIVY CONSENT MESSAGE LISTENER
// ============================

window.addEventListener("message", function (event) {
    try {
        if (!event.data) return;

        // ✅ Check Privy event
        if (event.data.name === "consent-notice-result") {

            const result = JSON.parse(event.data.resultSet);

            console.log("Consent Result Parsed:", result);

            // ✅ ACCEPTED CASE
            if (
                result.data_principal_action === "accepted" ||
                result.type === "grant"
            ) {
                console.log("Consent accepted, redirecting...");
                closeConsentPopup();
                window.location.href = "login.html";
            }

            // ❌ REJECTED CASE
            else {
                alert("Consent was rejected. Registration cannot continue.");
            }
        }
    } catch (err) {
        console.error("Error processing iframe message", err);
    }
});


function closeConsentPopup() {
    const modal = document.getElementById("consentModal");
    if (modal) modal.remove();
}


