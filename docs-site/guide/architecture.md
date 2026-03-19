# Архітектура

## Структура проєкту

MuzaLife Frontend — React SPA на базі **Vite + TypeScript + Tailwind CSS**. Маршрутизація — `react-router-dom`, UI-примітиви — `@radix-ui`, форми — `react-hook-form`.

```
src/
├── components/
│   └── ui/              # shadcn/ui компоненти (Radix-based)
├── context/
│   └── AuthContext/     # Глобальний стан автентифікації
├── hooks/
│   ├── useAuth.ts       # Ініціалізація сесії при старті
│   ├── useFAQs.ts
│   ├── useSingleProduct.ts
│   └── useVerificationCode.ts
├── pages/               # Сторінки (роутер-рівень)
├── services/
│   └── api.ts           # Централізований ApiService (singleton)
├── utils/
│   └── cache-manager.ts # localStorage TTL-кеш
└── types.ts             # Глобальні TypeScript-інтерфейси
```

## Ключові архітектурні рішення

### Context API замість prop drilling

`AuthContext` надає стан автентифікації (`user`, `isLoading`, `error`) усьому дереву компонентів без явної передачі пропів. Це спрощує доступ до сесії в будь-якому компоненті через хук `useAuthContext()`.

### localStorage кешування

`CacheManager` зберігає профіль користувача та інші запити в `localStorage` із TTL. Це дозволяє моментальне відображення даних при наступному відвідуванні без зайвих мережевих запитів.

```ts
CacheManager.setWithTimestamp('profile', data, 5 * 60 * 1000); // 5 хв TTL
const cached = CacheManager.isCacheValid('profile', 5 * 60 * 1000);
```

### Захист від подвійного виклику React StrictMode

`useAuth` використовує ref-прапор `hasInitialized` для запобігання подвійній ініціалізації сесії в React 18 StrictMode (де ефекти виконуються двічі в dev-режимі).

### Singleton ApiService

`apiService` — єдиний екземпляр `ApiService`, що централізує всі HTTP-запити, додає JWT-заголовок та обробляє помилки в одному місці.

## Маршрутизація

| Маршрут | Компонент | Захист |
|---------|-----------|--------|
| `/` | `HomePage` | Публічний |
| `/login` | `LoginPage` | Анонімний |
| `/signup` | `SignUpPage` | Анонімний |
| `/product/:id` | `ProductPage` | Публічний |
| `/cabinet` | `UserCabinet` | JWT |
| `/admin` | `AdminPanel` | JWT + Admin |

## Технологічний стек

| Шар | Технологія |
|-----|-----------|
| Збірка | Vite 6 + SWC |
| UI | React 18 + TypeScript |
| Стилі | Tailwind CSS + shadcn/ui |
| Маршрутизація | react-router-dom 7 |
| Форми | react-hook-form |
| OAuth | @react-oauth/google |
| Документування | TypeDoc + TSDoc |
| Тестування | Vitest 4 |
