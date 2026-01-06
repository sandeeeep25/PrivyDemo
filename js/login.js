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

    const url = `${base}/api/LoginUser?code=${key}`;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await response.json();
    if (response.ok) {
        alert("Login successful!");
        localStorage.setItem("userId", result.userId);
        window.location.href = "index.html"; // redirect after login
    } else {
        alert("Error: " + result);
    }
});
