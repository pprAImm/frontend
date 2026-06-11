(function() {
    const episodesList = document.getElementById('episodesList');
    if (episodesList) {
        episodesList.addEventListener('click', function(e) {
            const episodeCard = e.target.closest('.episode-card');
            if (episodeCard) {
                window.location.href = 'start.html';
            }
        });
    }

    const addCommentBtn = document.getElementById('addCommentBtn');
    if (addCommentBtn) {
        addCommentBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'start.html';
        });
    }

    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.removeAttribute('readonly');
        searchInput.value = '';
        searchInput.style.cursor = 'text';
        searchInput.style.userSelect = 'auto';

        searchInput.addEventListener('input', function(e) {
            console.log('Поиск:', e.target.value);
        });

        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const searchQuery = searchInput.value.trim();
                if (searchQuery) {
                    sessionStorage.setItem('lastSearchQuery', searchQuery);
                }
                window.location.href = 'start.html';
            }
        });
    }

    const userDiv = document.getElementById('userNameDisplay');
    if (userDiv) {
        userDiv.style.cursor = 'default';
    }

    const logo = document.querySelector('.logo-icon');
    if (logo) {
        logo.style.cursor = 'default';
    }
})(); 
