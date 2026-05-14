# Помощник по подбору мебели

Веб-сервис для поиска мебели по фотографии, параметрам и фото интерьера.  
Бэкенд — Python (Flask, SQLAlchemy, SocketIO). Фронтенд — React.  
База данных — 350 товаров с Яндекс.Маркета.

---

## Возможности

| Режим | Описание |
|-------|----------|
| Поиск по фото | Загрузи фото мебели — нейросеть CLIP определит тип и цвет, выдаст до 20 похожих товаров |
| Расширенный поиск | Фильтры по типу, стилю, цвету, материалу, цене, габаритам, бренду |
| Подбор по интерьеру | Загрузи фото комнаты, выбери тип мебели — получи 3–7 подходящих вариантов |
| Избранное | Сохраняй понравившиеся товары (только для авторизованных) |
| Авторизация | Регистрация и вход по логину и паролю |

---

## Технологический стек

**Бэкенд (Python)**

| Библиотека | Назначение |
|-----------|-----------|
| Flask | Веб-фреймворк, маршрутизация HTTP-запросов |
| Flask-SQLAlchemy | ORM — работа с базой данных через Python-объекты |
| Flask-JWT-Extended | Авторизация на основе JWT-токенов |
| Flask-SocketIO + eventlet | WebSocket — прогресс поиска в реальном времени |
| bcrypt | Хеширование паролей |
| transformers + torch | Нейросеть CLIP для анализа изображений |
| Pillow | Обработка изображений |

**Фронтенд (JavaScript)**

| Библиотека | Назначение |
|-----------|-----------|
| React | Компонентный UI |
| axios | HTTP-запросы к API |
| socket.io-client | WebSocket-соединение |

**База данных:** SQLite (файл `furniture.db`)

---

## Структура проекта

```
├── backend/
│   ├── app.py          # Flask-приложение: эндпоинты, WebSocket
│   ├── models.py       # SQLAlchemy-модели: Furniture, User, Favorite
│   ├── database.py     # Слой доступа к данным (ORM-запросы)
│   └── ai_analyzer.py  # Нейросеть CLIP: анализ фото мебели и интерьера
├── frontend/
│   └── src/
│       ├── App.js                    # Главный компонент, состояние, WebSocket
│       └── components/
│           ├── ImageSearch.js        # Поиск по фото мебели
│           ├── ParamsSearch.js       # Расширенный поиск по параметрам
│           ├── RoomSearch.js         # Подбор мебели по фото комнаты
│           ├── Results.js            # Сетка карточек товаров
│           ├── ProductCard.js        # Карточка товара
│           ├── Favorites.js          # Страница избранного
│           └── Auth.js               # Форма входа / регистрации
├── scripts/
│   └── load_csv_data.py  # Загрузка товаров из CSV в базу данных
├── divany.csv            # Датасет: 350 товаров с Яндекс.Маркета
├── .env                  # Секретные ключи (не коммитить)
├── .env.example          # Пример конфигурации
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
```

---

## Быстрый старт

### Требования
- Python 3.9+
- Node.js 16+

### 1. Настроить `.env`

```bash
copy .env.example .env
```

Открой `.env` и задай секретные ключи (можно сгенерировать):

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

```
JWT_SECRET_KEY=<сгенерированная строка>
FLASK_SECRET_KEY=<сгенерированная строка>
```

### 2. Установить зависимости бэкенда

```bash
pip install -r requirements.txt --timeout 120
```

> Если таймаут на PyTorch — установи отдельно:
> ```bash
> pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
> ```

### 3. Загрузить данные

```bash
python scripts/load_csv_data.py divany.csv
```

### 4. Запустить бэкенд

```bash
cd backend
python app.py
```

Бэкенд: `http://localhost:5000`

### 5. Запустить фронтенд

```bash
cd frontend
npm install
npm start
```

Фронтенд: `http://localhost:3000`

---

## Запуск через Docker

```bash
docker-compose up --build
```

---

## API

| Метод | URL | Авторизация | Описание |
|-------|-----|-------------|----------|
| GET | `/api/health` | — | Проверка сервера |
| POST | `/api/auth/register` | — | Регистрация |
| POST | `/api/auth/login` | — | Вход |
| POST | `/api/search/image` | — | Поиск по фото мебели |
| POST | `/api/search/params` | — | Расширенный поиск |
| POST | `/api/search/room` | — | Подбор по фото комнаты |
| GET | `/api/favorites` | JWT | Получить избранное |
| POST | `/api/favorites/<id>` | JWT | Добавить в избранное |
| DELETE | `/api/favorites/<id>` | JWT | Удалить из избранного |
| GET | `/api/furniture/types` | — | Список типов мебели |
| GET | `/api/furniture/styles` | — | Список стилей |
| GET | `/api/furniture/colors` | — | Список цветов |
| GET | `/api/furniture/materials` | — | Список материалов |

---

## Переменные окружения

| Переменная | Описание | По умолчанию |
|-----------|----------|-------------|
| `JWT_SECRET_KEY` | Секрет для подписи JWT | — |
| `FLASK_SECRET_KEY` | Секрет Flask-сессий | — |
| `PORT` | Порт бэкенда | `5000` |

---

## Модели данных

```python
# Три таблицы с настроенными ORM-отношениями

Furniture  ──< Favorite >── User
```

- `Furniture` — товар: название, тип, цена, габариты, материалы, цвета, стиль, ссылки
- `User` — пользователь: логин, хеш пароля
- `Favorite` — связь пользователя с товаром (уникальная пара user_id + furniture_id)
