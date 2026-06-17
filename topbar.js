(function() {
    const API_BASE = '';

    function setUserName(name) {
        const el = document.getElementById('userNameDisplay');
        if (el) el.textContent = `${name}`;
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
                localStorage.setItem('prAIm_user', JSON.stringify({ username: user.username, email: user.email || '' }));
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
            let authed = false;
            try {
                const cached = localStorage.getItem('prAIm_user');
                if (cached) {
                    const data = JSON.parse(cached);
                    if (data && data.username) authed = true;
                }
            } catch (_) {}
            window.location.href = authed ? 'user.html' : 'registration.html';
        });
    }

    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
                }
            }
        });
    }
})();