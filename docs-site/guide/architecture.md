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

Усі маршрути визначені в `src/App.tsx`. Доступ контролюється трьома компонентами-охоронцями:

| Компонент | Умова доступу | Редірект |
|-----------|--------------|----------|
| `ProtectedRoute` | Користувач авторизований | `/login` |
| `PublicRoute` | Користувач **не** авторизований | `/` |
| `AdminRoute` | `user.is_admin === true` | `/` |

### Таблиця маршрутів

| Шлях | Компонент | Охоронець |
|------|-----------|-----------|
| `/` | `HomePage` | — |
| `/faqs` | `FAQsPage` | — |
| `/terms` | `TermsPage` | — |
| `/product/:id` | `SingleProductPage` | — |
| `/login` | `LoginPage` | `PublicRoute` |
| `/signup` | `SignUpPage` | `PublicRoute` |
| `/adminlogin` | `AdminLoginPage` | `PublicRoute` |
| `/cabinet` | `UserCabinet` | `ProtectedRoute` |
| `/admin` | `AdminPanel` | `AdminRoute` |
| `/payment/result` | `PaymentResultPage` | — |
| `*` | `NotFoundPage` | — (catch-all 404) |

## Управління станом

Застосунок використовує виключно React Context API — без Redux чи Zustand.

`AuthContext` (`src/context/AuthContext.tsx`) — єдиний провайдер на рівні кореня застосунку. Він надає:
- поточного користувача (`user`) та стан завантаження
- методи: `signInWithEmail`, `signUpWithEmail`, `signInWithOAuth`, `completeRegistration`, `signOut`

Споживається через хук `useAuth()` (`src/hooks/useAuth.ts`).

## API-шар

HTTP-клієнт розбитий на окремі модулі у `src/services/api/`:

| Модуль | Призначення |
|--------|------------|
| `client.ts` | Базовий `ApiClient` — JWT, авто-заголовки, обробка помилок |
| `auth.ts` | Логін, реєстрація, OAuth, гостьова верифікація |
| `profile.ts` | Профіль користувача, завантаження аватара |
| `products.ts` | Каталог, пошук, збережені продукти |
| `orders.ts` | Персональні замовлення |
| `payments.ts` | Інтеграція з LiqPay |
| `polls.ts` | Голосування, результати опитувань |
| `reviews.ts` | Відгуки до продуктів |
| `faqs.ts` | Список FAQ |
| `admin.ts` | Адмін: замовлення, матеріали, аналітика |
| `index.ts` | Збирає всі модулі в єдиний `apiService` синглтон |

Усі ендпоінти визначені в `src/config/index.ts`. Використовуйте лише `apiService` — не створюйте `ApiClient` напряму.

## Структура компонентів

```
src/
├── pages/              — компоненти-сторінки (рівень маршрутів)
├── components/
│   ├── admin/          — панель адміністратора (аналітика, замовлення, матеріали, опитування)
│   ├── auth/           — охоронці маршрутів, кнопки OAuth
│   ├── cabinet/        — кабінет користувача (збережені, покупки, замовлення, налаштування)
│   ├── common/         — спільні компоненти (ProductCard, SearchBar, Logo, ...)
│   ├── errors/         — ErrorBoundary
│   ├── faqs/           — компоненти FAQ
│   ├── features/       — Cart, FiltersSidebar, GuestCheckoutModal
│   ├── layout/         — Header, ProductsCanvas, DashboardCanvas, SidebarTabs
│   ├── product/        — деталі продукту (галерея, дії, інформація, відгуки)
│   └── ui/             — примітиви Radix UI + кастомні SVG-іконки
├── context/            — React Context провайдери
├── hooks/              — кастомні React хуки
├── services/api/       — HTTP-клієнт (модульна структура)
├── utils/              — CacheManager та logger
└── types/              — спільні TypeScript типи (мульти-модульний barrel-export)
```

## Аліаси шляхів

`@/` вказує на `src/`. Використовуйте його для всіх внутрішніх імпортів.

## Розбиття чанків

Vite ділить вендорний код на окремі чанки: `vendor-react`, `vendor-charts`, `vendor-radix`, `vendor-utils`.
