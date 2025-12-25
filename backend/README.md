# rating-university-backend

Бэкенд для проекта Rating University.

## Быстрый запуск

1. Скопируйте файл `.env.example` в `.env` и заполните значения (DATABASE_URL, SESSION_SECRET, CLIENT_ORIGIN).

2. Установите зависимости:

   npm install

3. Сгенерируйте Prisma-клиент и примените миграции:

   npx prisma generate
   npx prisma migrate dev --name init

4. Запустите dev-сервер:

   npm run dev

Сервер будет доступен на порту, указанном в `.env` (по умолчанию 4000). Фронтенд должен установить `VITE_API_BASE` в адрес бэкенда (например, `https://your-backend.onrender.com`).

---

## Развёртывание на Render (короткое руководство)

1. Запушьте репозиторий на GitHub и добавьте два сервиса на Render: **Web Service** для бэкенда и **Static Site** для фронтенда (или используйте `render.yaml` для автоматического создания).

2. Создайте или подключите экземпляр Postgres в Render (или используйте внешний DB). Скопируйте строку подключения (например: `postgres://user:pass@host:5432/dbname`).

3. Настройки сервиса бэкенда:
   - `Build Command`: `npm install`
   - `Start Command`: `npm start`
   - Переменные окружения (в Dashboard):
     - `DATABASE_URL` — строка подключения к Postgres
     - `SESSION_SECRET` — надёжная случайная строка
     - `CLIENT_ORIGIN` — origin фронтенда (например `https://your-frontend.onrender.com`)
     - `COOKIE_SAME_SITE=none` и `COOKIE_SECURE=true` (для кук между разными доменами)
     - `NODE_ENV=production`

4. Настройки фронтенда (Static Site):
   - `Build Command`: `npm install && npm run build`
   - `Publish Directory`: `dist`
   - Переменные окружения:
     - `VITE_API_BASE` = `https://<your-backend>.onrender.com` (установить до сборки)

5. Задеплойте оба сервиса. Если всё настроено правильно, фронтенд сможет вызывать бэкенд, и браузер будет принимать куки аутентификации.

Примечания:
- Для кросс-доменных (cross-site) кук должны быть установлены `COOKIE_SAME_SITE=none` и `COOKIE_SECURE=true`; фронтенд должен выполнять запросы с `credentials: 'include'`.
- `CLIENT_ORIGIN` поддерживает несколько форматов (через запятую): полный origin (например `https://your-frontend.onrender.com`), только hostname (`your-frontend.onrender.com`), записи домена с точкой для поддоменов (например `.onrender.com`) и `*` для разрешения всех источников (не рекомендуется вместе с credentialed requests).
- Если вы увидите ошибку `CORS policy does not allow access from the specified Origin`, проверьте логи бэкенда — сервер теперь логирует заблокированный `Origin` и список разрешённых значений; убедитесь, что в `CLIENT_ORIGIN` есть соответствующая запись, либо добавьте домен/поддомен.

### Локальное тестирование с Docker Compose

1. Установите Docker & Docker Compose.
2. В корне репозитория выполните:

   docker-compose up --build

3. Сервисы будут доступны по адресам:
   - Фронтенд: http://localhost:3000
   - Бэкенд: http://localhost:4000

4. После поднятия БД примените миграции локально:

   # в другом терминале (в контейнере backend)
   docker-compose exec backend sh -c "npx prisma migrate dev --name init --preview-feature"

5. Откройте фронтенд и протестируйте регистрацию/вход. Для проверки кук и запросов используйте DevTools (Network / Application).

---

Если хотите, я могу добавить небольшой health-check (уже есть по `/health`) и скрипт для автоматического применения миграций при старте контейнера бэкенда. Что предпочитаете?