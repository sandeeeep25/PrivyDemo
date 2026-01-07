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

    const result = await response.json();
    if (response.ok) {
        alert("Login successful!");
        localStorage.setItem("userId", result.userId);
        window.location.href = "index.html"; // redirect after login
    } else {
        alert("Error: " + result);
    }
});
