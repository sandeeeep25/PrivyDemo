document.getElementById("manageConsentBtn").addEventListener("click", async (e) => {
    e.preventDefault();
    console.log("Manage Consent clicked");
    const base = window.__APP_CONFIG && window.__APP_CONFIG.API_BASE;
    const key = window.__APP_CONFIG && window.__APP_CONFIG.FUNCTION_KEY;

    if (!base || !key) {
        alert("Configuration missing");
        return;
    }

    // ✅ login ke time jo store kiya tha
    const dataPrincipalId = localStorage.getItem("privy_Data_Principal_Id");
    console.log("Data Principal ID:", dataPrincipalId);

    if (!dataPrincipalId) {
        alert("User not logged in");
        return;
    }

    try {
        const response = await fetch(`${base}/api/generateDPARLink?code=${key}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                dataPrincipalId: dataPrincipalId   // 🔥 mapping here
            })
        });

        const result = await response.json();

        if (response.ok) {
            // ✅ new tab me open
            window.open(result.link, "_blank");
        } else {
            alert(result?.message || "Failed to generate consent link");
        }

    } catch (err) {
        console.error("DPAR error:", err);
        alert("Server error while generating consent link");
    }
});