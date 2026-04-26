# Початок роботи

## Вимоги

| Інструмент | Версія |
|-----------|--------|
| Node.js   | 20.x   |
| npm       | 10+    |
| mkcert    | latest |

## Встановлення

```bash
git clone https://github.com/VladimiKoroviakov/muzalife_frontend.git
cd muzalife_frontend
npm install
```

## Змінні середовища

Створіть файл `.env` в кореневій директорії проєкту:

```bash
VITE_API_URL=https://localhost:5001/api
VITE_APP_NAME=MuzaLife
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_FACEBOOK_APP_ID=your_facebook_app_id_here
```

## Налаштування HTTPS

OAuth провайдери (Google, Facebook) вимагають HTTPS. Згенеруйте локальні сертифікати:

```bash
mkcert -install
mkcert -cert-file localhost.pem -key-file localhost-key.pem localhost 127.0.0.1
```

## Запуск

```bash
npm run dev        # сервер розробки на https://localhost:3000
npm run build      # production збірка → build/
npm run type-check # TypeScript перевірка типів
npm run lint       # ESLint
npm run lint:docs  # перевірка TSDoc покриття
npm run check      # lint + type-check + test:docs (CI gate)
```

## Документація

```bash
npm run docs        # TypeDoc → docs/typedoc/
npm run test:docs   # живі тести-документація
```

## Основні залежності

| Пакет | Призначення |
|-------|------------|
| react + react-dom | UI фреймворк |
| react-router-dom | Клієнтська маршрутизація |
| @radix-ui/* | Доступні UI-примітиви |
| react-hook-form | Форми з валідацією |
| @react-oauth/google | Google OAuth |
| lucide-react | Іконки |
| tailwindcss | CSS утиліти |
| recharts | Графіки (admin аналітика) |
| sonner | Toast-сповіщення |
