(function() {
    const API_BASE = '';
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    const moviesGrid = document.getElementById('moviesGrid');

    function renderMovie(movie) {
        const card = document.createElement('article');
        card.className = 'movie-card';

        const img = document.createElement('img');
        img.className = 'movie-cover';
        img.src = movie.cover_url || 'https://placehold.co/420x236/23253a/white?text=🎬&font=montserrat';
        img.alt = movie.title || 'Сериал';
        img.addEventListener('click', () => {
            window.location.href = `series.html?id=${movie.id}`;
        });

        const body = document.createElement('div');
        body.className = 'movie-card-body';

        const title = document.createElement('h3');
        title.className = 'movie-title';
        title.textContent = movie.title || '';

        const desc = document.createElement('p');
        desc.className = 'movie-desc';
        desc.textContent = movie.description || '';

        const rating = document.createElement('div');
        rating.className = 'movie-rating';
        rating.innerHTML = `Рейтинг: <span>${movie.average_rating ?? '-'}</span>`;

        body.appendChild(title);
        body.appendChild(desc);
        body.appendChild(rating);
        card.appendChild(img);
        card.appendChild(body);

        return card;
    }

    if (slug) {
        // Load category and its series from API
        fetch(`${API_BASE}/api/categories/${encodeURIComponent(slug)}`, { credentials: 'include' })
            .then(r => r.ok ? r.json() : Promise.reject(r))
            .then(data => {
                const cat = data.category;
                if (cat) {
                    document.title = `${cat.name} — prAIm`;
                    document.getElementById('categoryTitle').textContent = cat.name;
                    document.getElementById('categoryDescription').textContent = cat.description || '';
                    document.getElementById('categoryBadge').textContent = 'Категория';
                }

                const series = data.series || [];
                if (series.length === 0) {
                    moviesGrid.innerHTML = '<div class="empty-state">В этой категории ещё нет сериалов.</div>';
                    return;
                }

                series.forEach(s => moviesGrid.appendChild(renderMovie({
                    id: s.id,
                    title: s.title,
                    description: s.description,
                    cover_url: s.cover_url,
                    average_rating: s.average_rating,
                })));
            })
            .catch(err => {
                console.debug('Failed to load category from API, falling back to static content', err);
                moviesGrid.innerHTML = '<div class="empty-state">Не удалось загрузить данные категории.</div>';
            });
    } else {
        moviesGrid.innerHTML = '<div class="empty-state">Категория не указана.</div>';
    }
})();