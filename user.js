(function() {
    const API_BASE = '';

    // === PROFILE HERO ===
    function loadProfile() {
        const nameEl = document.getElementById('profileUserName');
        const emailEl = document.getElementById('profileUserEmail');
        const avatarEl = document.getElementById('profileAvatar');

        try {
            const cached = localStorage.getItem('prAIm_user');
            if (cached) {
                const data = JSON.parse(cached);
                if (data.username) {
                    nameEl.textContent = data.username;
                    avatarEl.textContent = data.username.charAt(0).toUpperCase();
                }
                if (data.email) {
                    emailEl.textContent = data.email;
                }
            }
        } catch (_) {}

        fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' })
            .then(r => r.ok ? r.json() : Promise.reject(r))
            .then(user => {
                if (user.username) {
                    nameEl.textContent = user.username;
                    avatarEl.textContent = user.username.charAt(0).toUpperCase();
                }
                if (user.email) {
                    emailEl.textContent = user.email;
                }
                localStorage.setItem('prAIm_user', JSON.stringify({
                    username: user.username || '',
                    email: user.email || ''
                }));
            })
            .catch(() => {
                if (emailEl && !emailEl.textContent.trim()) {
                    emailEl.textContent = 'guest@example.com';
                }
            });
    }
    loadProfile();

    // === MY SERIES ===
    const flex = document.getElementById('profileFlex');
    if (flex) {
        const addCard = document.createElement('div');
        addCard.className = 'my-series-add';
        addCard.addEventListener('click', function() {
            window.location.href = 'create.html';
        });
        const addIcon = document.createElement('div');
        addIcon.className = 'add-icon';
        addIcon.textContent = '+';
        const addLabel = document.createElement('div');
        addLabel.className = 'add-label';
        addLabel.textContent = 'добавить';
        addCard.appendChild(addIcon);
        addCard.appendChild(addLabel);
        flex.appendChild(addCard);

        (async function loadSeries() {
            try {
                const resp = await fetch(`${API_BASE}/api/series/search?q=`, { credentials: 'include' });
                if (!resp.ok) throw new Error('Failed to load series');
                const series = await resp.json();
                series.forEach(s => {
                    const card = document.createElement('div');
                    card.className = 'my-series-card';
                    card.addEventListener('click', function() {
                        window.location.href = `create.html?id=${s.id}`;
                    });

                    const img = document.createElement('img');
                    img.className = 'my-series-card-img';
                    img.src = s.cover_url || 'https://placehold.co/220x132/23253a/white?text=🎬&font=montserrat';
                    img.alt = s.title || '';
                    img.loading = 'lazy';
                    img.onerror = function() {
                        this.src = 'https://placehold.co/220x132/23253a/white?text=🎬&font=montserrat';
                    };

                    const label = document.createElement('div');
                    label.className = 'my-series-card-label';
                    label.textContent = s.title || 'Name';

                    card.appendChild(img);
                    card.appendChild(label);
                    flex.appendChild(card);
                });
            } catch (_) {
                for (let i = 1; i <= 8; i++) {
                    const card = document.createElement('div');
                    card.className = 'my-series-card';
                    card.addEventListener('click', function() {
                        window.location.href = 'series.html';
                    });
                    const img = document.createElement('img');
                    img.className = 'my-series-card-img';
                    img.src = `popular${i}.png`;
                    img.alt = 'Сериал';
                    img.onerror = function() {
                        this.onerror = null;
                        this.src = 'https://placehold.co/220x132/23253a/white?text=🎬&font=montserrat';
                    };
                    const label = document.createElement('div');
                    label.className = 'my-series-card-label';
                    label.textContent = 'Name';
                    card.appendChild(img);
                    card.appendChild(label);
                    flex.appendChild(card);
                }
            }
        })();

        const track = document.getElementById('profileTrack');
        if (track) {
            track.addEventListener('wheel', function(e) {
                if (e.deltaY !== 0) {
                    e.preventDefault();
                    this.scrollLeft += e.deltaY;
                }
            }, { passive: false });

            let isDown = false;
            let startX;
            let scrollLeftStart;

            track.addEventListener('mousedown', function(e) {
                if (e.target.closest('.my-series-card, .my-series-add')) return;
                isDown = true;
                startX = e.pageX - this.offsetLeft;
                scrollLeftStart = this.scrollLeft;
                this.style.cursor = 'grabbing';
                this.style.userSelect = 'none';
            });

            window.addEventListener('mouseup', function() {
                if (!isDown) return;
                isDown = false;
                track.style.cursor = 'grab';
                track.style.userSelect = '';
            });

            window.addEventListener('mousemove', function(e) {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - track.offsetLeft;
                const walk = (x - startX) * 1.2;
                track.scrollLeft = scrollLeftStart - walk;
            });

            track.style.cursor = 'grab';
        }
    }

    const nameForm = document.getElementById('nameForm');
    const passwordForm = document.getElementById('passwordForm');
    const logoutButton = document.getElementById('logoutButton');
    const nameInput = document.getElementById('profileName');

    if (nameForm) {
        nameForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const newName = nameInput.value.trim();
            if (!newName) {
                alert('Введите имя пользователя.');
                return;
            }
            try {
                const resp = await fetch(`${API_BASE}/api/auth/me`, {
                    method: 'PUT',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: newName })
                });
                if (!resp.ok) {
                    const err = await resp.json().catch(() => ({}));
                    alert(err.error || 'Ошибка при смене имени');
                    return;
                }
                const user = await resp.json();
                localStorage.setItem('prAIm_user', JSON.stringify({ username: user.username || newName }));
                const nameEl = document.getElementById('profileUserName');
                if (nameEl) nameEl.textContent = user.username || newName;
                const avatarEl = document.getElementById('profileAvatar');
                if (avatarEl) avatarEl.textContent = (user.username || newName).charAt(0).toUpperCase();
                const displayEl = document.getElementById('userNameDisplay');
                if (displayEl) displayEl.textContent = user.username || newName;
                nameInput.value = '';
                alert('Имя пользователя успешно изменено.');
            } catch (_) {
                alert('Ошибка сети при смене имени');
            }
        });
    }

    if (passwordForm) {
        passwordForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const currentPassword = document.getElementById('currentPassword').value.trim();
            const newPassword = document.getElementById('newPassword').value.trim();
            const confirmPassword = document.getElementById('confirmPassword').value.trim();

            if (!currentPassword || !newPassword || !confirmPassword) {
                alert('Заполните все поля.');
                return;
            }
            if (newPassword !== confirmPassword) {
                alert('Пароли не совпадают.');
                return;
            }
            alert('Пароль успешно изменён.');
            passwordForm.reset();
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' });
            } catch (_) {}
            localStorage.removeItem('prAIm_user');
            window.location.href = 'login.html';
        });
    }
})();