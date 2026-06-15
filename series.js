(function() {
    const episodesList = document.getElementById('episodesList');
    const addCommentBtn = document.getElementById('addCommentBtn');
    const commentsList = document.getElementById('commentsList');
    const titleEl = document.querySelector('.series-title');
    const bannerImg = document.querySelector('.series-banner img');
    const descEl = document.querySelector('.series-description');
    const ratingValue = document.querySelector('.rating-value');

    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'), 10);

    if (!id) {
        titleEl.textContent = 'Сериал не указан';
        return;
    }

    function renderEpisode(ep) {
        const card = document.createElement('div');
        card.className = 'episode-card';
        card.dataset.episode = ep.id;
        card.innerHTML = `<span class="episode-number">Серия ${ep.episode_num ?? ''}</span><span class="episode-title">${ep.title ?? ''}</span>`;
        return card;
    }

    function renderComment(c) {
        const el = document.createElement('div');
        el.className = 'comment-item';
        el.innerHTML = `<strong>${c.username}</strong> <time>${new Date(c.created_at).toLocaleString()}</time><p>${c.body}</p>`;
        return el;
    }

    // Load series data
    fetch(`/api/series/${id}`, { credentials: 'include' })
        .then(r => r.ok ? r.json() : Promise.reject(r))
        .then(data => {
            const s = data.series;
            if (!s) throw new Error('Series not found');

            titleEl.textContent = s.title || 'Сериал';
            descEl.textContent = s.description || '';
            if (s.cover_url) bannerImg.src = s.cover_url;
            ratingValue.textContent = (s.average_rating != null) ? `${s.average_rating} / 10` : '—';

            // episodes
            const eps = data.episodes || [];
            episodesList.innerHTML = '';
            eps.forEach(ep => episodesList.appendChild(renderEpisode(ep)));
        })
        .catch(err => {
            console.error('Failed to load series:', err);
            titleEl.textContent = 'Ошибка загрузки сериала';
        });

    // Load comments
    function loadComments() {
        fetch(`/api/series/${id}/comments`, { credentials: 'include' })
            .then(r => r.ok ? r.json() : Promise.reject(r))
            .then(list => {
                commentsList.innerHTML = '';
                if (!list || list.length === 0) {
                    commentsList.innerHTML = '<p class="comments-empty">Комментариев пока нет. Будьте первым!</p>';
                    return;
                }
                list.forEach(c => commentsList.appendChild(renderComment(c)));
            })
            .catch(err => console.debug('Failed to load comments', err));
    }

    loadComments();

    if (addCommentBtn) {
        addCommentBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            const body = prompt('Введите комментарий:');
            if (!body) return;
            try {
                const res = await fetch(`/api/series/${id}/comments`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ body })
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    alert(err.error || 'Не удалось добавить комментарий');
                    return;
                }
                alert('Комментарий добавлен');
                loadComments();
            } catch (err) {
                console.error(err);
                alert('Ошибка сети при добавлении комментария');
            }
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
