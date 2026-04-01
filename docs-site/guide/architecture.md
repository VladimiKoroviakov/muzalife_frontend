# Архітектура

## Стек технологій

| Шар | Технологія |
|-----|-----------|
| UI фреймворк | React 18 + TypeScript 5 |
| Збірник | Vite 6 (SWC) |
| Маршрутизація | React Router v7 |
| Стан | React Context API |
| Стилі | Tailwind CSS 4 + Radix UI |
| Тести | Vitest |

## Маршрутизація

Усі маршрути визначені в `src/App.tsx` через `BrowserRouter`. Доступ до маршрутів контролюється трьома компонентами-охоронцями:

| Компонент | Умова доступу | Редірект |
|-----------|--------------|----------|
| `ProtectedRoute` | Користувач авторизований | `/login` |
| `PublicRoute` | Користувач **не** авторизований | `/` |
| `AdminRoute` | `user.is_admin === true` | `/` |

## Управління станом

Застосунок використовує виключно React Context API — без Redux чи Zustand.

`AuthContext` (`src/context/AuthContext.tsx`) — єдиний провайдер на рівні кореня застосунку. Він надає:
- поточного користувача (`user`) та стан завантаження
- методи: `signInWithEmail`, `signUpWithEmail`, `signInWithOAuth`, `completeRegistration`, `signOut`

Споживається через хук `useAuth()` (`src/hooks/useAuth.ts`).

## API-шар

`ApiService` (`src/services/api.ts`) — клас-синглтон з приватним методом `http<T>()`, який:
- автоматично додає заголовок `Authorization: Bearer` з `localStorage['authToken']`
- парсить відповіді як JSON
- кидає `Error` з полем `error` від сервера при не-OK статусах

Усі ендпоінти визначені в `src/config/index.ts`. Використовуйте експортований екземпляр `apiService` — не створюйте новий.

## Структура компонентів

```
src/
├── pages/          — компоненти-сторінки (рівень маршрутів)
├── components/
│   ├── layout/     — спільні компоненти розмітки (DashboardHeader, DashboardRightSide)
│   ├── auth/       — охоронці маршрутів, кнопки OAuth
│   ├── cabinet/    — кабінет користувача
│   ├── admin/      — панель адміністратора
│   ├── ui/         — примітиви Radix UI (69 компонентів)
│   └── ...
├── context/        — React Context провайдери
├── hooks/          — кастомні React хуки
├── services/       — HTTP-клієнт
├── utils/          — CacheManager та утиліти
└── types.ts        — спільні TypeScript типи
```

## Аліаси шляхів

`@/` вказує на `src/`. Використовуйте його для всіх внутрішніх імпортів.

## Розбиття чанків

Vite ділить вендорний код на окремі чанки: `vendor-react`, `vendor-charts`, `vendor-radix`, `vendor-utils`.
