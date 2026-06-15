(function() {
    const API_BASE = `http://${window.location.hostname}:8081`;
    const nameForm = document.getElementById('nameForm');
    const passwordForm = document.getElementById('passwordForm');
    const logoutButton = document.getElementById('logoutButton');
    const nameInput = document.getElementById('profileName');

    if (nameForm) {
        nameForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const newName = nameInput.value.trim();
            if (!newName) {
                alert('Введите имя пользователя.');
                return;
            }
            alert(`Имя пользователя изменено на «${newName}».`);
            nameInput.value = '';
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