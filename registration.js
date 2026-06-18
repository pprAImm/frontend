(function() {
    const API_BASE = '';

    const registrationForm = document.getElementById('registration-form');
    const loginForm = document.getElementById('login-form');

    if (registrationForm) {
        registrationForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const res = await fetch(`${API_BASE}/api/auth/register`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    alert(err.error || 'Ошибка регистрации');
                    return;
                }

                const userData = await res.json();
                localStorage.setItem('prAIm_user', JSON.stringify({ username: userData.username, email: userData.email || '' }));

                // Показываем сообщение о подтверждении email вместо перехода на главную
                const container = document.querySelector('.registration-container');
                if (container) {
                    container.innerHTML = `
                        <h1>Регистрация завершена</h1>
                        <p style="margin: 20px 0; line-height: 1.6; color: rgba(255,255,255,0.8);">
                            Мы отправили письмо для подтверждения на адрес <strong>${email}</strong>.
                        </p>
                        <p style="margin: 20px 0; line-height: 1.6; color: rgba(255,255,255,0.8);">
                            Пожалуйста, проверьте вашу почту и нажмите на ссылку в письме, чтобы подтвердить email.
                        </p>
                        <p style="margin: 16px 0;">
                            <button id="resend-btn" style="background:#8b5cf6;color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:14px;">Отправить письмо ещё раз</button>
                        </p>
                        <p id="resend-status" style="margin: 8px 0; font-size:13px; color:rgba(255,255,255,0.6);"></p>
                        <p style="margin-top: 24px;">
                            <a href="login.html" style="color: #8b5cf6;">Перейти к входу</a>
                        </p>
                    `;
                    document.getElementById('resend-btn').addEventListener('click', function() {
                        resendVerification(email);
                    });
                }
            } catch (e) {
                console.error(e);
                alert('Ошибка сети при регистрации');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const res = await fetch(`${API_BASE}/api/auth/login`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    if (err.error && err.error.includes('Email не подтверждён')) {
                        const container = document.querySelector('.registration-container');
                        if (container) {
                            container.innerHTML = `
                                <h1>Email не подтверждён</h1>
                                <p style="margin: 20px 0; line-height: 1.6; color: rgba(255,255,255,0.8);">
                                    ${err.error}
                                </p>
                                <p style="margin: 16px 0;">
                                    <button id="resend-btn" style="background:#8b5cf6;color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:14px;">Отправить письмо ещё раз</button>
                                </p>
                                <p id="resend-status" style="margin: 8px 0; font-size:13px; color:rgba(255,255,255,0.6);"></p>
                            `;
                            document.getElementById('resend-btn').addEventListener('click', function() {
                                resendVerification(email);
                            });
                        }
                        return;
                    }
                    alert(err.error || 'Ошибка входа');
                    return;
                }

                const userData = await res.json();
                localStorage.setItem('prAIm_user', JSON.stringify({ username: userData.username, email: userData.email || '' }));

                navigateWithAnimation('central.html');
            } catch (e) {
                console.error(e);
                alert('Ошибка сети при входе');
            }
        });
    }

    // Animation helpers
    const links = document.querySelectorAll('a[href="registration.html"], a[href="login.html"]');
    links.forEach(link => {
        link.addEventListener('click', function(event) {
            const targetUrl = this.getAttribute('href');
            const currentPage = window.location.pathname.split('/').pop();
            if (targetUrl === currentPage) return;
            event.preventDefault();
            document.body.classList.add('page-exit');
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 300);
        });
    });

    const buttons = document.querySelectorAll('button[type="submit"]');
    buttons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            this.style.transform = 'scale(0.96)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });

    setTimeout(() => {
        const firstInput = document.querySelector('input');
        if (firstInput) {
            firstInput.style.transition = 'all 0.3s';
            firstInput.style.boxShadow = '0 0 0 3px rgba(59, 110, 160, 0.2)';
            setTimeout(() => {
                firstInput.style.boxShadow = '';
            }, 500);
        }
    }, 200);
})();

function navigateWithAnimation(url) {
    document.body.classList.add('page-exit');
    setTimeout(() => {
        window.location.href = url;
    }, 300);
}

async function resendVerification(email) {
    const btn = document.getElementById('resend-btn');
    const status = document.getElementById('resend-status');
    if (btn) btn.disabled = true;
    if (status) status.textContent = 'Отправка...';
    try {
        const res = await fetch('/api/auth/verify/resend', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            if (status) status.textContent = err.error || 'Ошибка отправки';
            if (btn) btn.disabled = false;
            return;
        }
        if (status) status.textContent = 'Письмо отправлено! Проверьте почту.';
        if (status) status.style.color = '#22c55e';
    } catch (e) {
        if (status) status.textContent = 'Ошибка сети';
        if (btn) btn.disabled = false;
    }
}
