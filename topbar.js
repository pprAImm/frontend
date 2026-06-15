(function() {
    const API_BASE = `http://${window.location.hostname}:8081`;

    function setUserName(name) {
        const el = document.getElementById('userNameDisplay');
        if (el) el.textContent = `👤 ${name}`;
    }

    // Try localStorage first (fast, set during login)
    try {
        const cached = localStorage.getItem('prAIm_user');
        if (cached) {
            const data = JSON.parse(cached);
            if (data && data.username) setUserName(data.username);
        }
    } catch (_) {}

    // Then fetch from API (ensures fresh data and handles direct page loads)
    (async function loadUser() {
        try {
            const resp = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' });
            if (resp.ok) {
                const user = await resp.json();
                setUserName(user.username);
                localStorage.setItem('prAIm_user', JSON.stringify({ username: user.username }));
            } else {
                localStorage.removeItem('prAIm_user');
            }
        } catch (_) {}
    })();

    const logo = document.querySelector('.logo-icon');
    const userDisplay = document.getElementById('userNameDisplay');

    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', () => {
            window.location.href = 'central.html';
        });
    }

    if (userDisplay) {
        userDisplay.style.cursor = 'pointer';
        userDisplay.addEventListener('click', () => {
            window.location.href = 'user.html';
        });
    }
})();