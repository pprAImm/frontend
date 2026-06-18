(function() {
    const API_BASE = '';
    const episodesList = document.getElementById('episodesList');
    const addCommentBtn = document.getElementById('addCommentBtn');
    const commentInput = document.getElementById('commentInput');
    const commentsList = document.getElementById('commentsList');
    const titleEl = document.getElementById('seriesTitle');
    const coverImg = document.getElementById('seriesCover');
    const categoriesEl = document.getElementById('seriesCategories');
    const descEl = document.getElementById('seriesDescription');
    const ratingValue = document.getElementById('ratingValue');
    const rateStars = document.getElementById('rateStars');
    const stars = rateStars ? rateStars.querySelectorAll('.star') : [];
    const ratingFeedback = document.getElementById('ratingFeedback');

    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'), 10);

    if (!id) {
        titleEl.textContent = 'Сериал не указан';
        return;
    }

    let watchProgress = {};

    function renderEpisode(ep) {
        const card = document.createElement('div');
        card.className = 'episode-card';
        card.dataset.episode = ep.id;

        const progress = watchProgress[ep.id];
        const isCompleted = progress && progress.completed;
        const hasProgress = progress && progress.progress_seconds > 0 && !progress.completed;

        let badgeText = '';
        if (isCompleted) badgeText = '✓ Просмотрено';
        else if (hasProgress) badgeText = `▶ ${Math.floor(progress.progress_seconds / 60)}:${Math.floor(progress.progress_seconds % 60).toString().padStart(2, '0')}`;

        const badgeHtml = badgeText ? `<span class="episode-badge ${isCompleted ? 'completed' : 'progress'}">${badgeText}</span>` : '';
        card.innerHTML = `<span class="episode-title">${ep.title ?? ''}</span>${badgeHtml}`;

        if (isCompleted) card.classList.add('episode-watched');

        card.addEventListener('click', function() {
            window.location.href = `player.html?seriesId=${id}&episodeId=${ep.id}`;
        });
        return card;
    }

    function loadWatchProgress() {
        return fetch(`${API_BASE}/api/series/${id}/progress`, { credentials: 'include' })
            .then(r => r.ok ? r.json() : [])
            .then(list => {
                watchProgress = {};
                (list || []).forEach(wp => {
                    watchProgress[wp.episode_id] = wp;
                });
            })
            .catch(function() {});
    }

    function renderComment(c) {
        const el = document.createElement('div');
        el.className = 'comment-item';
        const avatarLetter = c.username ? c.username.charAt(0).toUpperCase() : '?';
        el.innerHTML = `
            <div class="comment-avatar">${avatarLetter}</div>
            <div class="comment-body">
                <div class="comment-header">
                    <strong class="comment-username">${c.username}</strong>
                    <span class="comment-date">${new Date(c.created_at).toLocaleString()}</span>
                </div>
                <p class="comment-text">${c.body}</p>
            </div>`;
        return el;
    }

    function setStars(score) {
        stars.forEach(s => {
            s.classList.toggle('active', parseInt(s.dataset.score) <= score);
        });
    }

    // Load series data
    fetch(`${API_BASE}/api/series/${id}`, { credentials: 'include' })
        .then(r => r.ok ? r.json() : Promise.reject(r))
        .then(data => {
            const s = data.series;
            if (!s) throw new Error('Series not found');

            titleEl.textContent = s.title || 'Сериал';
            descEl.textContent = s.description || '';
            if (s.cover_url) coverImg.src = s.cover_url;
            ratingValue.textContent = (s.average_rating != null) ? `${s.average_rating} / 10` : '—';

            if (s.categories && s.categories.length) {
                s.categories.forEach(cat => {
                    const chip = document.createElement('span');
                    chip.className = 'series-category-chip';
                    chip.textContent = cat.name || cat.slug || cat;
                    categoriesEl.appendChild(chip);
                });
            }

            if (s.average_rating != null) {
                setStars(Math.round(s.average_rating));
            }

            const eps = data.episodes || [];
            episodesList.innerHTML = '';
            eps.forEach(ep => episodesList.appendChild(renderEpisode(ep)));

            // Load watch progress and re-render episodes with badges
            loadWatchProgress().then(() => {
                episodesList.innerHTML = '';
                eps.forEach(ep => episodesList.appendChild(renderEpisode(ep)));
            }).catch(function() {});
        })
        .catch(err => {
            console.error('Failed to load series:', err);
            titleEl.textContent = 'Ошибка загрузки сериала';
        });

    // Rating stars click
    let rated = false;
    stars.forEach(s => {
        s.addEventListener('click', async function() {
            const score = parseInt(this.dataset.score);
            try {
                const res = await fetch(`${API_BASE}/api/series/${id}/rating`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ score })
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    alert(err.error || 'Ошибка при оценке');
                    return;
                }
                rated = true;
                setStars(score);
                if (ratingFeedback) {
                    ratingFeedback.textContent = `Ваша оценка: ${score}`;
                    ratingFeedback.classList.remove('hidden');
                }
                const ratingRes = await fetch(`${API_BASE}/api/series/${id}/rating`, { credentials: 'include' });
                if (ratingRes.ok) {
                    const ratingData = await ratingRes.json();
                    ratingValue.textContent = `${ratingData.average} / 10`;
                }
            } catch (err) {
                console.error(err);
                alert('Ошибка сети при оценке');
            }
        });
    });

    // Load comments
    function loadComments() {
        fetch(`${API_BASE}/api/series/${id}/comments`, { credentials: 'include' })
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
            const body = commentInput ? commentInput.value.trim() : '';
            if (!body) {
                alert('Введите текст комментария');
                return;
            }
            try {
                const res = await fetch(`${API_BASE}/api/series/${id}/comments`, {
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
                if (commentInput) commentInput.value = '';
                loadComments();
            } catch (err) {
                console.error(err);
                alert('Ошибка сети при добавлении комментария');
            }
        });
    }

    if (commentInput) {
        commentInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                addCommentBtn.click();
            }
        });
    }

    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.removeAttribute('readonly');
        searchInput.value = '';
        searchInput.style.cursor = 'text';
        searchInput.style.userSelect = 'auto';

        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const searchQuery = searchInput.value.trim();
                if (searchQuery) {
                    window.location.href = `search.html?q=${encodeURIComponent(searchQuery)}`;
                }
            }
        });
    }
})();