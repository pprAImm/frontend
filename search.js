(function() {
const API_BASE = '';

const searchInput = document.getElementById('searchInput');
const resultsGrid = document.getElementById('resultsGrid');
const resultsCount = document.getElementById('resultsCount');
const noResults = document.getElementById('noResults');
const searchError = document.getElementById('searchError');
const initialSection = document.getElementById('initialSection');
const initialGrid = document.getElementById('initialGrid');

const searchBtn = document.getElementById('searchBtn');

searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') performSearch();
});
if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
}

async function fetchAllSeries() {
    const res = await fetch(`${API_BASE}/api/series/search?q=`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch series');
    return res.json();
}

async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    initialSection.style.display = 'none';
    searchError.style.display = 'none';
    resultsGrid.innerHTML = '<div class="loading">Поиск...</div>';

    try {
        let results = [];
        const res = await fetch(`${API_BASE}/api/series/search?q=${encodeURIComponent(query)}`, {
            credentials: 'include'
        });

        if (res.ok) {
            results = await res.json();
        } else {
            const allSeries = await fetchAllSeries();
            results = allSeries.filter(s =>
                s.title && s.title.toLowerCase().includes(query.toLowerCase())
            );
        }

        displayResults(results);
    } catch (err) {
        console.error('Search error:', err);

        try {
            const allSeries = await fetchAllSeries();
            const results = allSeries.filter(s =>
                s.title && s.title.toLowerCase().includes(query.toLowerCase())
            );
            if (results.length > 0) {
                displayResults(results);
                return;
            }
        } catch (_) {}

        resultsGrid.innerHTML = '';
        searchError.style.display = 'block';
    }
}

function displayResults(results) {
    resultsGrid.innerHTML = '';
    noResults.style.display = 'none';
    searchError.style.display = 'none';

    if (!results || results.length === 0) {
        noResults.style.display = 'block';
        resultsCount.textContent = '';
        return;
    }

    const word = results.length % 10 === 1 && results.length % 100 !== 11 ? '' : 'ов';
    resultsCount.textContent = `Найдено ${results.length} сериал${word}:`;

    results.forEach(series => {
        const card = document.createElement('div');
        card.className = 'series-card';
        card.onclick = () => window.location.href = `series.html?id=${series.id}`;

        const img = document.createElement('img');
        img.src = series.cover_url || 'https://placehold.co/150x200/23253a/white?text=No+Image';
        img.alt = series.title;
        img.onerror = function() { this.src = 'https://placehold.co/150x200/23253a/white?text=?'; };

        const title = document.createElement('div');
        title.className = 'title';
        title.textContent = series.title;

        card.appendChild(img);
        card.appendChild(title);
        resultsGrid.appendChild(card);
    });
}

async function loadInitialResults() {
    try {
        const response = await fetch(`${API_BASE}/api/series/search?q=`, { credentials: 'include' });
        if (response.ok) {
            const series = await response.json();
            const initial = series.slice(0, 12);
            if (initial.length > 0) {
                initialGrid.innerHTML = '';
                initial.forEach(s => {
                    const card = document.createElement('div');
                    card.className = 'series-card';
                    card.onclick = () => window.location.href = `series.html?id=${s.id}`;
                    const img = document.createElement('img');
                    img.src = s.cover_url || 'https://placehold.co/150x200/23253a/white?text=No+Image';
                    img.alt = s.title;
                    img.onerror = function() { this.src = 'https://placehold.co/150x200/23253a/white?text=?'; };
                    const title = document.createElement('div');
                    title.className = 'title';
                    title.textContent = s.title;
                    card.appendChild(img);
                    card.appendChild(title);
                    initialGrid.appendChild(card);
                });
            }
        }
    } catch (_) {}
}

const params = new URLSearchParams(window.location.search);
const queryParam = params.get('q');
if (queryParam) {
    searchInput.value = queryParam;
    performSearch();
} else {
    loadInitialResults();
}
})();
