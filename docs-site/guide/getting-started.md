# Початок роботи

## Вимоги

| Інструмент | Версія |
|-----------|--------|
| Node.js   | 20.x   |
| npm       | 10+    |

## Встановлення

```bash
git clone https://github.com/your-org/muzalife-frontend.git
cd muzalife-frontend
npm install --legacy-peer-deps
```

## Запуск

```bash
npm run dev        # сервер розробки на https://localhost:3000
npm run build      # production збірка
npm run type-check # TypeScript перевірка типів
```

## Документація

```bash
npm run docs          # TypeDoc → docs/typedoc/
npm run test:docs     # живі тести-документація
npm run docs:archive  # docs/typedoc.zip
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
