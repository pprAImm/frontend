// API configuration
const API_BASE = '';

const categories = [
    { slug: 'fruits', name: 'Фрукты', image: 'assets/images/fruits.png' },
    { slug: 'asian', name: 'Азия', image: 'assets/images/asian.png' },

    { slug: 'romance', name: 'Романтика', image: 'assets/images/romantic.png' },
    { slug: 'comedy', name: 'Комедия', image: 'assets/images/comedy.png' },
    { slug: 'horror', name: 'Ужасы', image: 'assets/images/horror.png' },
    { slug: 'drama', name: 'Драма', image: 'assets/images/drama.png' },
];

function renderCategoryCard(slug, name, imageUrl) {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.onclick = () => window.location.href = `category.html?slug=${encodeURIComponent(slug)}`;

    const img = document.createElement('img');
    img.className = 'category-img';
    img.src = imageUrl || '';
    img.alt = name;
    img.loading = 'lazy';
    img.onerror = function() {
        this.style.display = 'none';
    };

    card.appendChild(img);
    return card;
}

async function loadCategories() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE}/api/categories`, { credentials: 'include' });
        if (response.ok) {
            const apiCategories = await response.json();
            container.innerHTML = '';
            apiCategories.filter(cat => cat.slug !== 'anime').forEach(cat => {
                const entry = categories.find(c => c.slug === cat.slug);
                container.appendChild(renderCategoryCard(cat.slug, cat.name, entry ? entry.image : ''));
            });
            return;
        }
    } catch (_) {}

    // Fallback: render from static mapping
    container.innerHTML = '';
    categories.forEach(cat => {
        container.appendChild(renderCategoryCard(cat.slug, cat.name, cat.image));
    });
}

function renderSeriesCard(s, averageRating) {
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

// Load popular series (Bayesian weighted top 16)
async function loadPopularSeries() {
    try {
        const response = await fetch(`${API_BASE}/api/series/popular`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to load popular');
        const series = await response.json();

        const container = document.getElementById('seriesContainer');
        if (!container) return;
        container.innerHTML = '';
        series.forEach(s => {
            container.appendChild(renderSeriesCard(s, s.average_rating));
        });
    } catch (err) {
        console.error('Error loading popular series:', err);
    }
}

// Load newest series (by id DESC)
async function loadNewSeries() {
    try {
        const response = await fetch(`${API_BASE}/api/series/new`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to load new series');
        const series = await response.json();

        const container = document.getElementById('newSeriesContainer');
        if (!container) return;
        container.innerHTML = '';
        series.forEach(s => {
            container.appendChild(renderSeriesCard(s, s.average_rating));
        });
    } catch (err) {
        console.error('Error loading new series:', err);
    }
}

// Load categories and series
async function checkAuthentication() {
    await Promise.all([loadCategories(), loadPopularSeries(), loadNewSeries()]);
}

// Logout function
async function logout() {
    try {
        await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (err) {
        console.error('Logout error:', err);
    }
    localStorage.removeItem('prAIm_user');
    window.location.href = 'central.html';
}

// Fallback for old HTML structure
function setupLegacyCategories() {
    const categoriesFlex = document.getElementById('categoriesFlex');
    if (!categoriesFlex) return;

    const categoriesData = [];
    for (let i = 1; i <= 10; i++) {
        categoriesData.push({
            id: i,
            imgSrc: `fon${i}.png`
        });
    }

    function renderCards(container, dataArray, targetUrl = 'start.html') {
        if (!container) return;
        container.innerHTML = '';
        dataArray.forEach(item => {
            const card = document.createElement('div');
            card.className = 'category-card';
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                const url = typeof targetUrl === 'function' ? targetUrl(item) : targetUrl;
                window.location.href = url;
            });

            const img = document.createElement('img');
            img.className = 'category-img';
            img.src = item.imgSrc;
            img.alt = 'Карточка';
            img.onerror = function() {
                this.onerror = null;
                this.src = 'https://placehold.co/220x132/23253a/white?text=🎬&font=montserrat';
            };

            card.appendChild(img);
            container.appendChild(card);
        });
    }

    renderCards(categoriesFlex, categoriesData);

    const popularFlex = document.getElementById('popularFlex');
    const popularData = [];
    for (let i = 1; i <= 10; i++) {
        popularData.push({
            id: i,
            imgSrc: `popular${i}.png`
        });
    }
    renderCards(popularFlex, popularData);

    // Setup scroll controls
    function scrollTrack(trackElement, direction) {
        if (!trackElement) return;
        const scrollAmount = 280;
        if (direction === 'left') {
            trackElement.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else if (direction === 'right') {
            trackElement.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }

    // Setup scroll controls
    function scrollTrack(trackElement, direction) {
        if (!trackElement) return;
        const scrollAmount = 280;
        if (direction === 'left') {
            trackElement.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else if (direction === 'right') {
            trackElement.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }

    const categoriesTrack = document.getElementById('categoriesTrack');
    const popularTrack = document.getElementById('popularTrack');

    const leftCategories = document.getElementById('scrollLeftCategories');
    const rightCategories = document.getElementById('scrollRightCategories');
    if (leftCategories) {
        leftCategories.addEventListener('click', (e) => {
            e.preventDefault();
            scrollTrack(categoriesTrack, 'left');
        });
    }
    if (rightCategories) {
        rightCategories.addEventListener('click', (e) => {
            e.preventDefault();
            scrollTrack(categoriesTrack, 'right');
        });
    }

    const leftPopular = document.getElementById('scrollLeftPopular');
    const rightPopular = document.getElementById('scrollRightPopular');
    if (leftPopular) {
        leftPopular.addEventListener('click', (e) => {
            e.preventDefault();
            scrollTrack(popularTrack, 'left');
        });
    }
    if (rightPopular) {
        rightPopular.addEventListener('click', (e) => {
            e.preventDefault();
            scrollTrack(popularTrack, 'right');
        });
    }

    // Setup wheel scroll
    function setupWheelScroll(trackElement) {
        if (!trackElement) return;
        trackElement.addEventListener('wheel', (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                trackElement.scrollLeft += e.deltaY;
            }
        }, { passive: false });
    }

    setupWheelScroll(categoriesTrack);
    setupWheelScroll(popularTrack);
    renderCards(categoriesFlex, categoriesData);
    renderCards(popularFlex, popularData);
}


// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if we have new HTML structure with #categoriesContainer
    const newContainer = document.getElementById('categoriesContainer');
    
    if (newContainer) {
        // Use new functions for new structure
        checkAuthentication();

        // Scroll controls for categories
        const track = document.getElementById('categoriesTrack');
        const catLeft = document.getElementById('catScrollLeft');
        const catRight = document.getElementById('catScrollRight');
        if (track && catLeft) {
            catLeft.addEventListener('click', () => {
                track.scrollBy({ left: -300, behavior: 'smooth' });
            });
        }
        if (track && catRight) {
            catRight.addEventListener('click', () => {
                track.scrollBy({ left: 300, behavior: 'smooth' });
            });
        }
    } else {
        // Fallback for legacy HTML structure
        setupLegacyCategories();
    }
});
