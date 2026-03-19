# MuzaLife Frontend — Документація (Українська)

> Ця тека містить документацію українською мовою.
> Англійська версія знаходиться у `docs/i18n/en/`.

## Зміст

- [Стандарти документування](#стандарти-документування)
- [Архітектура](#архітектура)
- [Ключові модулі](#ключові-модулі)
- [Інструменти](#інструменти)
- [Внесок у проєкт](#внесок-у-проєкт)

---

## Стандарти документування

| Рівень | Стандарт | Інструмент |
|--------|----------|------------|
| Модуль / файл | TSDoc `@fileoverview` | TypeDoc |
| Функція / хук | TSDoc `@param`, `@returns`, `@example` | TypeDoc |
| Інтерфейс / тип | TSDoc поля з описами | TypeDoc |
| Якість | eslint-plugin-jsdoc | ESLint |
| Живі приклади | Vitest living docs | Vitest |

---

## Архітектура

```
src/
├── context/
│   └── AuthContext.tsx      — глобальний стан автентифікації
│                              (Context API, уникаємо prop-drilling)
├── hooks/
│   ├── useAuth.ts           — завантаження профілю, захист від
│   │                          дублювань у React StrictMode (useRef)
│   ├── useFAQs.ts           — отримання FAQ; порожній масив = помилка
│   ├── useSingleProduct.ts  — продукт за ID з refetch патерном
│   └── useVerificationCode.ts — управління OTP форми
├── services/
│   └── api.ts               — єдиний HTTP-клієнт (JWT + CacheManager)
├── utils/
│   └── cache-manager.ts     — localStorage кеш з timestamp валідацією
└── types.ts                 — спільні TypeScript типи (суфікси Props, ApiResponse)
```

### Потік автентифікації

```
App (AuthProvider)
  └── useAuth() — завантажує профіль при mount
        ├── GET /api/users/profile + Bearer token
        ├── Зберігає у AuthContext { user, token, isAuthenticated }
        └── On sign-out: CacheManager.clearUserCache()
```

---

## Ключові модулі

### CacheManager (`src/utils/cache-manager.ts`)

Статичний клас для `localStorage`-кешування з перевіркою терміну дії:

```typescript
// Зберегти з часовою міткою
CacheManager.setWithTimestamp('cachedProducts', products);

// Перевірити актуальність (5 хвилин)
if (CacheManager.isCacheValid('cachedProducts', 5 * 60 * 1000)) {
  return CacheManager.getItem<Product[]>('cachedProducts');
}

// Очистити при виході
CacheManager.clearUserCache();
```

### AuthContext (`src/context/AuthContext.tsx`)

```typescript
const { user, token, isAuthenticated, login, logout } = useAuthContext();
```

### API Service (`src/services/api.ts`)

Всі запити централізовані через один екземпляр. Автоматично додає JWT заголовок та інтегрується з CacheManager.

---

## Інструменти

```bash
# TypeDoc → docs/typedoc/ (Markdown)
npm run docs

# Очистити та повторно згенерувати
npm run docs:clean

# Архів docs/typedoc.zip
npm run docs:archive

# Живі тести-документація
npm run test:docs
```

---

## Внесок у проєкт

1. Кожен хук і утиліт повинен мати `@fileoverview` та TSDoc на публічних функціях
2. Нові типи/інтерфейси в `types.ts` документуються полями з описами
3. Для нових класів/утилітів додавайте тест у `src/tests/docs/`
