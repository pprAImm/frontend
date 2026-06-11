# AI-Serial Frontend

Фронтенд-часть платформы для просмотра ИИ-сериалов.

## Структура проекта

```
frontend/
├── assets/images/
│   ├── add.png          — Баннер для страниц central и series
│   ├── background1.png  — Фоновое изображение для всех страниц
│   └── background1.jpg  — Не используется (дубликат)
│
├── login.html           — Страница входа
├── registration.html    — Страница регистрации
├── central.html         — Главное меню с категориями и популярным
├── series.html          — Страница сериала (эпизоды, рейтинг, комментарии)
├── start.html           — Приветственная страница (модальное окно с ENTER)
│
├── registration.css     — Стили для login, registration и общие анимации
├── central.css          — Стили для главного меню
├── series.css           — Стили для страницы сериала
│
├── registration.js      — Логика форм, анимации переходов между страницами
├── central.js           — Отрисовка карточек, прокрутка, поиск
├── series.js            — Обработка кликов по эпизодам и комментариям
│
├── CODEOWNERS           — Правила владельцев кода для GitHub
└── README.md            — Этот файл
```

## Навигация

| Страница          | Куда ведёт                                    |
|-------------------|-----------------------------------------------|
| `start.html`      | → `registration.html` (кнопка ENTER)          |
| `registration.html` | → `login.html` / → `central.html` (форма)   |
| `login.html`      | → `registration.html` / → `central.html` (форма) |
| `central.html`    | Категории → `start.html`, Популярное → `series.html` |
| `series.html`     | Эпизоды и комментарии → `start.html`          |
 
## Запуск локально 
 
Установите расширение **Live Server** в VS Code, откройте `login.html` и нажмите "Open with live server".
