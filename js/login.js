document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const base = window.__APP_CONFIG && window.__APP_CONFIG.API_BASE;
    const key = window.__APP_CONFIG && window.__APP_CONFIG.FUNCTION_KEY;
    console.log("API_BASE:", base);

    if (!base || !key) {
        alert("Configuration missing");
        return;
    }

    const data = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
    };

    try {
        const response = await fetch(`${base}/api/newLogin?code=${key}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const contentType = response.headers.get("content-type") || "";
        let result = null;

        if (contentType.includes("application/json")) {
            result = await response.json();
        } else {
            result = await response.text();
        }

        if (response.ok) {
            // ✅ Login allowed only if AccountStatus = ACTIVE (backend enforced)
            localStorage.setItem("userId", result.userId);
            localStorage.setItem("privy_Data_Principal_Id", result.dataPrincipalId.toLowerCase()); // 🔥 store dataPrincipalId for DPAR
            window.location.href = "home.html";
        } else {
            // ❌ Consent not granted OR invalid credentials
            alert(result?.message || "Login failed. Consent may not be granted.");
        }

    } catch (err) {
        console.error("Login error:", err);
        alert("Login failed due to server error");
    }
});
