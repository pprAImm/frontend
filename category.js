(function() {
    const API_BASE = '';
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    const seriesGrid = document.getElementById('seriesGrid');

    function renderCard(s, averageRating) {
        const card = document.createElement('div');
        card.className = 'series-card';
        card.onclick = () => window.location.href = `series.html?id=${s.id}`;

        const img = document.createElement('img');
        img.src = s.cover_url || 'https://placehold.co/150x200';
        img.onerror = function() {
            this.src = 'https://placehold.co/150x200';
        };

        const info = document.createElement('div');
        info.className = 'series-card-info';

        const title = document.createElement('div');
        title.className = 'title';
        title.textContent = s.title;

        const desc = document.createElement('div');
        desc.className = 'desc';
        desc.textContent = s.description || '';

        const rating = document.createElement('div');
        rating.className = 'rating';
        rating.innerHTML = `Рейтинг: <span>${averageRating ?? '-'}</span>`;

        info.appendChild(title);
        info.appendChild(desc);
        info.appendChild(rating);
        card.appendChild(img);
        card.appendChild(info);
        return card;
    }

    if (slug) {
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
                    seriesGrid.innerHTML = '<div class="no-results">В этой категории ещё нет сериалов.</div>';
                    return;
                }

                series.forEach(s => seriesGrid.appendChild(renderCard(s, s.average_rating)));
            })
            .catch(err => {
                console.debug('Failed to load category from API, falling back to static content', err);
                seriesGrid.innerHTML = '<div class="no-results">Не удалось загрузить данные категории.</div>';
            });
    } else {
        seriesGrid.innerHTML = '<div class="no-results">Категория не указана.</div>';
    }
})();
