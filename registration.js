const registrationForm = document.getElementById('registration-form');
if (registrationForm) {
    registrationForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch('/api/auth/register', {
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

            // Успех — переходим на главную
            navigateWithAnimation('central.html');
        } catch (e) {
            console.error(e);
            alert('Ошибка сети при регистрации');
        }
    });
}

(function() {
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

if (registrationForm) {
    registrationForm.addEventListener('submit', function(event) {
        event.preventDefault();
        navigateWithAnimation('central.html');
    });
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                alert(err.error || 'Ошибка входа');
                return;
            }

            navigateWithAnimation('central.html');
        } catch (e) {
            console.error(e);
            alert('Ошибка сети при входе');
        }
    });
}