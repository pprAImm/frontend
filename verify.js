(function() {
    const API_BASE = '';
    const statusEl = document.getElementById('statusMessage');

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
        statusEl.className = 'status-message status-error';
        statusEl.innerHTML = '<p>Ошибка: токен не указан в ссылке.</p>';
        return;
    }

    (async function verify() {
        try {
            const res = await fetch(API_BASE + '/api/auth/verify?token=' + encodeURIComponent(token), {
                credentials: 'include'
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                statusEl.className = 'status-message status-error';
                statusEl.innerHTML = '<p>' + (err.error || 'Ошибка подтверждения email') + '</p>';
                return;
            }

            const data = await res.json();

            if (data.status === 'verified') {
                statusEl.className = 'status-message status-success';
                statusEl.innerHTML = '<p>Email успешно подтверждён! Теперь вы можете войти в аккаунт.</p>';
            } else if (data.status === 'already_verified') {
                statusEl.className = 'status-message status-already';
                statusEl.innerHTML = '<p>Этот email уже был подтверждён ранее.</p>';
            } else {
                statusEl.className = 'status-message status-success';
                statusEl.innerHTML = '<p>Email подтверждён!</p>';
            }
        } catch (e) {
            statusEl.className = 'status-message status-error';
            statusEl.innerHTML = '<p>Ошибка сети. Проверьте подключение к интернету.</p>';
        }
    })();
})();
