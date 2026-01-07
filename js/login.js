document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
    };

    // Use server-side proxy on Vercel to keep secrets private
    const url = '/api/azure-proxy/api/LoginUser';

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const contentType = response.headers.get('content-type') || '';
    let result;
    if (contentType.includes('application/json')) {
        try { result = await response.json(); } catch (_) { result = null; }
    } else {
        try { result = await response.text(); } catch (_) { result = null; }
    }

    if (response.ok) {
        alert("Login successful!");
        if (result && result.userId) localStorage.setItem("userId", result.userId);
        window.location.href = "index.html";
    } else {
        const message = (result && result.message) ? result.message : (typeof result === 'string' ? result : JSON.stringify(result));
        alert("Error: " + message);
    }
});
