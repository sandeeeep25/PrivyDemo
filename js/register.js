document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
        const password = document.getElementById("password").value; // plain-text for PoC

        const data = {
            username: document.getElementById("username").value,
            password: password,
            email: document.getElementById("email").value,
            name: document.getElementById("name").value,
            phone: document.getElementById("phone").value,
            analytics: document.getElementById("analyticsCookies").checked ? 1 : 0,
            marketing: document.getElementById("marketingCookies").checked ? 1 : 0
        };

        // Use server-side proxy on Vercel to keep secrets private
        const url = '/api/azure-proxy/api/test';

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
            alert("Registered successfully!");
            window.location.href = "login.html";
        } else {
            console.error('Registration failed', response.status, result);
            const message = (result && result.message) ? result.message : (typeof result === 'string' ? result : JSON.stringify(result));
            alert("Error: " + message);
        }
    } catch (err) {
        console.error('Network or JS error during registration', err);
        alert('Registration failed: ' + (err && err.message ? err.message : String(err)));
    }
});
