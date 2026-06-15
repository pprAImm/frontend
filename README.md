# prAIm Frontend

Фронтенд-часть платформы для просмотра ИИ-сериалов.

## Структура проекта

```
frontend/
├── assets/images/
│   ├── fruits.png          — Категория «Фрукты»
│   ├── asian.png           — Категория «Азия»
│   ├── romantic.png        — Категория «Романтика»
│   ├── comedy.png          — Категория «Комедия»
│   ├── horror.png          — Категория «Ужасы»
│   ├── drama.png           — Категория «Драма»
│   └── add.png             — Баннер на главной
│
├── login.html              — Страница входа
├── registration.html       — Страница регистрации
├── central.html            — Главное меню (категории + популярное)
├── search.html             — Страница поиска
├── category.html           — Страница категории
├── series.html             — Страница сериала (эпизоды, рейтинг, комментарии)
├── user.html               — Личный кабинет
├── start.html              — Приветственная страница (модальное окно с ENTER)
├── movie.html              — Устаревшая страница фильма (не используется)
│
├── registration.css        — Стили для login, registration
├── central.css             — Стили для главного меню, поиска, категорий, карточек
├── series.css              — Стили для страницы сериала
│
├── registration.js         — Логика форм регистрации/входа, анимации переходов
├── central.js              — Отрисовка категорий, популярного, скролл, поиск
├── search.js               — Поиск по сериалам
├── category.js             — Отрисовка сериалов в категории
├── series.js               — Загрузка сериала, рейтинг, комментарии
├── topbar.js               — Загрузка имени пользователя, навигация по клику
├── user.js                 — Личный кабинет (смена имени/пароля, выход)
│
├── logo.png                — Логотип
├── README.md               — Этот файл
└── node_modules/           — Зависимости (не требуются для работы)
```

## Навигация

| Страница             | Куда ведёт                                                            |
|----------------------|-----------------------------------------------------------------------|
| `start.html`         | → `central.html` (кнопка ENTER) / → `registration.html`               |
| `registration.html`  | → `login.html` / → `central.html` (после успешной регистрации)        |
| `login.html`         | → `registration.html` / → `central.html` (после успешного входа)      |
| `central.html`       | Категории → `category.html`, Популярное → `series.html`               |
| `search.html`        | Результаты → `series.html`                                            |
| `category.html`      | Сериалы → `series.html`                                               |
| `series.html`        | Имя пользователя → `user.html`                                        |
| `user.html`          | Выход → `login.html`                                                  |

## API

Фронтенд общается с бэкендом через gateway на порту 8081:
- `http://localhost:8081/api/categories` — список категорий
- `http://localhost:8081/api/categories/{slug}` — категория с сериалами
- `http://localhost:8081/api/series/{id}` — сериал с эпизодами
- `http://localhost:8081/api/series/search?q=` — поиск сериалов
- `http://localhost:8081/api/series/{id}/rating` — рейтинг сериала
- `http://localhost:8081/api/series/{id}/comments` — комментарии
- `http://localhost:8081/api/auth/login` — вход
- `http://localhost:8081/api/auth/register` — регистрация

## Запуск локально

```bash
python3 -m http.server 3000
```

Откройте `http://localhost:3000/start.html` в браузере.

Для работы API также должны быть запущены:
- **core-backend** (порт 8080)
- **gateway** (порт 8081)
- **PostgreSQL** (порт 5432)

## Зависимости

- Node.js / npm — не требуются для работы (файлы статические)
- Python 3 — для сервера разработки
