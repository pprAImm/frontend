(function() {
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