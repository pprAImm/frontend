(function() {
    const movies = [
        { id: 101, categoryId: 1, title: 'Звёздный путь', rating: '8.8', imgSrc: 'assets/images/movie1.png', genre: 'Фантастика', description: 'Эпическая история о человечестве, исследующем дальние уголки Вселенной.', episodes: [
            { number: 1, title: 'Первый контакт', duration: '42 мин' },
            { number: 2, title: 'Темная звезда', duration: '44 мин' },
            { number: 3, title: 'Предел горизонта', duration: '41 мин' },
            { number: 4, title: 'Скрытая угроза', duration: '45 мин' }
        ] },
        { id: 102, categoryId: 1, title: 'Искусственный разум', rating: '8.2', imgSrc: 'assets/images/movie2.png', genre: 'Фантастика', description: 'Фильм о том, как ИИ учится понимать человека и собственную свободу.', episodes: [
            { number: 1, title: 'Рождение мысли', duration: '40 мин' },
            { number: 2, title: 'Второй разум', duration: '43 мин' },
            { number: 3, title: 'Пробуждение', duration: '44 мин' }
        ] },
        { id: 103, categoryId: 2, title: 'Ночной след', rating: '7.9', imgSrc: 'assets/images/movie3.png', genre: 'Триллер', description: 'Триллер о двух детективах, которым предстоит разгадать темную тайну города.', episodes: [
            { number: 1, title: 'Исчезновение', duration: '38 мин' },
            { number: 2, title: 'По следам', duration: '41 мин' },
            { number: 3, title: 'Анонимное сообщение', duration: '39 мин' }
        ] },
        { id: 104, categoryId: 2, title: 'Погоня за правдой', rating: '8.0', imgSrc: 'assets/images/movie4.png', genre: 'Триллер', description: 'Напряжённый сюжет о журналистах, раскрывающих задержанную правду.', episodes: [
            { number: 1, title: 'Начало расследования', duration: '43 мин' },
            { number: 2, title: 'Опасный источник', duration: '42 мин' },
            { number: 3, title: 'Выбор', duration: '44 мин' }
        ] },
        { id: 105, categoryId: 3, title: 'Сердце города', rating: '8.4', imgSrc: 'assets/images/movie5.png', genre: 'Драма', description: 'Драма о семье, которая борется за свое место и мечты.', episodes: [
            { number: 1, title: 'Дом на холме', duration: '39 мин' },
            { number: 2, title: 'Семейные узлы', duration: '42 мин' },
            { number: 3, title: 'Выбор пути', duration: '40 мин' }
        ] },
        { id: 106, categoryId: 3, title: 'Темные воспоминания', rating: '8.1', imgSrc: 'assets/images/movie6.png', genre: 'Драма', description: 'История о прошлых ошибках и пути к прощению.', episodes: [
            { number: 1, title: 'Призрак', duration: '41 мин' },
            { number: 2, title: 'Запретный альбом', duration: '44 мин' },
            { number: 3, title: 'Пробуждение', duration: '45 мин' }
        ] },
        { id: 107, categoryId: 4, title: 'Наша компания', rating: '7.6', imgSrc: 'assets/images/movie7.png', genre: 'Комедия', description: 'Комедия про друзей, которые попадают в смешные и нелепые ситуации.', episodes: [
            { number: 1, title: 'Первое знакомство', duration: '36 мин' },
            { number: 2, title: 'Необычный план', duration: '38 мин' },
            { number: 3, title: 'Большой сюрприз', duration: '37 мин' }
        ] },
        { id: 108, categoryId: 4, title: 'Кофе и коты', rating: '7.8', imgSrc: 'assets/images/movie8.png', genre: 'Комедия', description: 'Лёгкий и тёплый фильм о маленьком кафе и его посетителях.', episodes: [
            { number: 1, title: 'Первое утро', duration: '35 мин' },
            { number: 2, title: 'Кофейный секрет', duration: '36 мин' },
            { number: 3, title: 'Случайный гость', duration: '38 мин' }
        ] },
        { id: 109, categoryId: 5, title: 'Сказания Теней', rating: '8.9', imgSrc: 'assets/images/movie9.png', genre: 'Аниме', description: 'Аниме о приключениях в мире магии и древних легенд.', episodes: [
            { number: 1, title: 'Тень прошлого', duration: '23 мин' },
            { number: 2, title: 'Огонь и ветер', duration: '24 мин' },
            { number: 3, title: 'Клинок судьбы', duration: '25 мин' }
        ] },
        { id: 110, categoryId: 5, title: 'Код будущего', rating: '8.3', imgSrc: 'assets/images/movie10.png', genre: 'Аниме', description: 'Аниме о хакерах и виртуальной реальности, где всё решает смелость.', episodes: [
            { number: 1, title: 'Вход в сеть', duration: '24 мин' },
            { number: 2, title: 'Пароль истины', duration: '25 мин' },
            { number: 3, title: 'Последний бой', duration: '26 мин' }
        ] }
    ];

    const params = new URLSearchParams(window.location.search);
    const movieId = parseInt(params.get('id'), 10);
    const movie = movies.find((item) => item.id === movieId);
    const cover = document.getElementById('movieCover');
    const title = document.getElementById('movieTitle');
    const rating = document.getElementById('movieRating');
    const description = document.getElementById('movieDescription');
    const genreLabel = document.getElementById('movieGenre');
    const backLink = document.getElementById('backLink');
    const episodesList = document.getElementById('episodesList');

    function renderEpisodes(episodes) {
        episodesList.innerHTML = '';
        if (!episodes.length) {
            episodesList.innerHTML = '<div class="episode-empty">Эпизоды не найдены.</div>';
            return;
        }

        episodes.forEach((episode) => {
            const row = document.createElement('div');
            row.className = 'episode-row';

            const number = document.createElement('div');
            number.className = 'episode-number';
            number.textContent = episode.number;

            const title = document.createElement('div');
            title.className = 'episode-title';
            title.textContent = episode.title;

            const duration = document.createElement('div');
            duration.className = 'episode-duration';
            duration.textContent = episode.duration;

            row.appendChild(number);
            row.appendChild(title);
            row.appendChild(duration);
            episodesList.appendChild(row);
        });
    }

    if (movie) {
        document.title = `${movie.title} — prAIm`;
        cover.src = movie.imgSrc;
        cover.alt = movie.title;
        cover.onerror = function() {
            this.onerror = null;
            this.src = 'https://placehold.co/720x405/23253a/white?text=🎬&font=montserrat';
        };
        title.textContent = movie.title;
        rating.innerHTML = `Рейтинг: <span>${movie.rating}</span>`;
        description.textContent = movie.description;
        genreLabel.textContent = movie.genre;
        backLink.href = `category.html?id=${movie.categoryId}`;
        renderEpisodes(movie.episodes || []);
    } else {
        title.textContent = 'Фильм не найден';
        rating.textContent = '';
        description.textContent = 'Выберите другой фильм на странице категории.';
        genreLabel.textContent = '—';
        cover.src = 'https://placehold.co/720x405/23253a/white?text=404';
        backLink.href = 'central.html';
    }
})();