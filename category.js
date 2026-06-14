(function() {
    const categories = [
        { id: 1, name: 'Фантастика', description: 'Космические путешествия, продвинутые технологии и новые миры.' },
        { id: 2, name: 'Триллеры', description: 'Напряжённые сюжеты с неожиданными поворотами и острыми эмоциями.' },
        { id: 3, name: 'Драма', description: 'Сильные события, глубокие персонажи и эмоциональные истории.' },
        { id: 4, name: 'Комедии', description: 'Лёгкие и смешные проекты для хорошего настроения.' },
        { id: 5, name: 'Аниме', description: 'Яркие визуальные истории из мира анимации и фантазии.' }
    ];

    const movies = [
        { id: 101, categoryId: 1, title: 'Звёздный путь', rating: '8.8', imgSrc: 'assets/images/movie1.png', description: 'Эпическая история о человечестве, исследующем дальние уголки Вселенной.' },
        { id: 102, categoryId: 1, title: 'Искусственный разум', rating: '8.2', imgSrc: 'assets/images/movie2.png', description: 'Фильм о том, как ИИ учится понимать человека и собственную свободу.' },
        { id: 103, categoryId: 2, title: 'Ночной след', rating: '7.9', imgSrc: 'assets/images/movie3.png', description: 'Триллер о двух детективах, которым предстоит разгадать темную тайну города.' },
        { id: 104, categoryId: 2, title: 'Погоня за правдой', rating: '8.0', imgSrc: 'assets/images/movie4.png', description: 'Напряжённый сюжет о журналистах, раскрывающих задержанную правду.' },
        { id: 105, categoryId: 3, title: 'Сердце города', rating: '8.4', imgSrc: 'assets/images/movie5.png', description: 'Драма о семье, которая борется за свое место и мечты.' },
        { id: 106, categoryId: 3, title: 'Темные воспоминания', rating: '8.1', imgSrc: 'assets/images/movie6.png', description: 'История о прошлых ошибках и пути к прощению.' },
        { id: 107, categoryId: 4, title: 'Наша компания', rating: '7.6', imgSrc: 'assets/images/movie7.png', description: 'Комедия про друзей, которые попадают в смешные и нелепые ситуации.' },
        { id: 108, categoryId: 4, title: 'Кофе и коты', rating: '7.8', imgSrc: 'assets/images/movie8.png', description: 'Лёгкий и тёплый фильм о маленьком кафе и его посетителях.' },
        { id: 109, categoryId: 5, title: 'Сказания Теней', rating: '8.9', imgSrc: 'assets/images/movie9.png', description: 'Аниме о приключениях в мире магии и древних легенд.' },
        { id: 110, categoryId: 5, title: 'Код будущего', rating: '8.3', imgSrc: 'assets/images/movie10.png', description: 'Аниме о хакерах и виртуальной реальности, где всё решает смелость.' }
    ];

    const params = new URLSearchParams(window.location.search);
    const categoryId = parseInt(params.get('id'), 10) || 1;
    const category = categories.find((item) => item.id === categoryId) || categories[0];

    document.title = `${category.name} — prAIm`;
    document.getElementById('categoryTitle').textContent = category.name;
    document.getElementById('categoryDescription').textContent = category.description;
    document.getElementById('categoryBadge').textContent = 'Категория';

    const moviesGrid = document.getElementById('moviesGrid');

    function renderMovie(movie) {
        const card = document.createElement('article');
        card.className = 'movie-card';

        const img = document.createElement('img');
        img.className = 'movie-cover';
        img.src = movie.imgSrc;
        img.alt = movie.title;
        img.addEventListener('click', () => {
            window.location.href = `movie.html?id=${movie.id}`;
        });
        img.onerror = function() {
            this.onerror = null;
            this.src = 'https://placehold.co/420x236/23253a/white?text=🎬&font=montserrat';
        };

        const body = document.createElement('div');
        body.className = 'movie-card-body';

        const title = document.createElement('h3');
        title.className = 'movie-title';
        title.textContent = movie.title;

        const rating = document.createElement('div');
        rating.className = 'movie-rating';
        rating.innerHTML = `Рейтинг: <span>${movie.rating}</span>`;

        body.appendChild(title);
        body.appendChild(rating);
        card.appendChild(img);
        card.appendChild(body);

        return card;
    }

    const filteredMovies = movies.filter((item) => item.categoryId === category.id);
    if (filteredMovies.length > 0) {
        filteredMovies.forEach((movie) => {
            moviesGrid.appendChild(renderMovie(movie));
        });
    } else {
        moviesGrid.innerHTML = '<div class="empty-state">В этой категории ещё нет фильмов.</div>';
    }
})();