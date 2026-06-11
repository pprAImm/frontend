(function() {
    // --------------------------------------------------------------
    // 1. ДАННЫЕ ДЛЯ КАТЕГОРИЙ (10 штук от fon1.png до fon10.png)
    // --------------------------------------------------------------
    const categoriesData = [];
    for (let i = 1; i <= 10; i++) {
        categoriesData.push({
            id: i,
            imgSrc: `fon${i}.png`
        });
    }

    // --------------------------------------------------------------
    // 2. ДАННЫЕ ДЛЯ ПОПУЛЯРНОГО (еще 10 карточек)
    // --------------------------------------------------------------
    const popularData = [];
    for (let i = 1; i <= 10; i++) {
        popularData.push({
            id: i,
            imgSrc: `popular${i}.png`
        });
    }

    const categoriesFlex = document.getElementById('categoriesFlex');
    const popularFlex = document.getElementById('popularFlex');
    const categoriesTrack = document.getElementById('categoriesTrack');
    const popularTrack = document.getElementById('popularTrack');

    function renderCards(container, dataArray, targetUrl = 'start.html') {
        if (!container) return;
        container.innerHTML = '';
        dataArray.forEach(item => {
            const card = document.createElement('div');
            card.className = 'category-card';
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                window.location.href = targetUrl;
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

    // Функция прокрутки
    function scrollTrack(trackElement, direction) {
        if (!trackElement) return;
        const scrollAmount = 280;
        if (direction === 'left') {
            trackElement.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else if (direction === 'right') {
            trackElement.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }

    // --------------------------------------------------------------
    // 3. НАСТРОЙКА СТРЕЛОК ДЛЯ КАТЕГОРИЙ
    // --------------------------------------------------------------
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

    // --------------------------------------------------------------
    // 4. НАСТРОЙКА СТРЕЛОК ДЛЯ ПОПУЛЯРНОГО
    // --------------------------------------------------------------
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

    // --------------------------------------------------------------
    // 5. ПОЛЕ ПОИСКА (РАБОТАЕТ, НЕ ПЕРЕБРАСЫВАЕТ)
    // --------------------------------------------------------------
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.removeAttribute('readonly');
        searchInput.value = '';
        searchInput.style.cursor = 'text';
        searchInput.style.userSelect = 'auto';
        
        // Просто демо-реакция на ввод
        searchInput.addEventListener('input', (e) => {
            console.log('Поиск:', e.target.value);
        });

        searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
        e.preventDefault();
        const searchQuery = searchInput.value.trim();
        console.log('Поисковый запрос:', searchQuery);
        // Сохраняем запрос в sessionStorage (опционально)
        if (searchQuery) {
            sessionStorage.setItem('lastSearchQuery', searchQuery);
        }
        window.location.href = 'start.html';
    }
});
    }

    // --------------------------------------------------------------
    // 6. НЕ ИНТЕРАКТИВНЫЕ ЭЛЕМЕНТЫ (баннер, логотип)
    //    Убираем у них курсор pointer и обработчики
    // --------------------------------------------------------------
    const banner = document.querySelector('.hero-banner');
    if (banner) {
        banner.style.cursor = 'default';
    }
    
    const logo = document.querySelector('.logo-icon');
    if (logo) {
        logo.style.cursor = 'default';
    }

    // Юзернейм  тоже не должен быть интерактивным (по умолчанию)
    const userDiv = document.getElementById('userNameDisplay');
    if (userDiv) {
        userDiv.style.cursor = 'default';
    }

    // --------------------------------------------------------------
    // 7. ГОРИЗОНТАЛЬНАЯ ПРОКРУТКА КОЛЕСИКОМ МЫШИ (для обеих лент)
    // --------------------------------------------------------------
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

    // --------------------------------------------------------------
    // 8. ПРОКРУТКА ПЕРЕТЯГИВАНИЕМ МЫШИ (drag to scroll) для обеих лент
    // --------------------------------------------------------------
    function setupDragScroll(trackElement) {
        if (!trackElement) return;
        let isDown = false;
        let startX;
        let scrollLeftStart;

        trackElement.addEventListener('mousedown', (e) => {
            if (e.target.closest('.scroll-btn')) return;
            isDown = true;
            startX = e.pageX - trackElement.offsetLeft;
            scrollLeftStart = trackElement.scrollLeft;
            trackElement.style.cursor = 'grabbing';
            trackElement.style.userSelect = 'none';
        });

        window.addEventListener('mouseup', () => {
            if (!isDown) return;
            isDown = false;
            trackElement.style.cursor = 'grab';
            trackElement.style.userSelect = '';
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - trackElement.offsetLeft;
            const walk = (x - startX) * 1.2;
            trackElement.scrollLeft = scrollLeftStart - walk;
        });

        trackElement.style.cursor = 'grab';
    }

    setupDragScroll(categoriesTrack);
    setupDragScroll(popularTrack);

    // --------------------------------------------------------------
    // 9. FALLBACK ДЛЯ ИЗОБРАЖЕНИЙ
    // --------------------------------------------------------------
    const bannerImg = document.querySelector('.hero-banner img');
    if (bannerImg && bannerImg.src.includes('add.png')) {
        bannerImg.onerror = function() {
            this.onerror = null;
            this.src = 'https://placehold.co/1600x400/1f2a48/white?text=';
        };
    }

    const logoImg = document.querySelector('.logo-icon img');
    if (logoImg) {
        logoImg.onerror = function() {
            this.onerror = null;
            this.src = 'https://placehold.co/32x32/2c3e66/white?text=🎬';
        };
    }

    // --------------------------------------------------------------
    // 10. ЗАПУСК ОТРИСОВКИ КАРТОЧЕК
    // --------------------------------------------------------------
    renderCards(categoriesFlex, categoriesData, 'start.html');
    renderCards(popularFlex, popularData, 'series.html');
})();