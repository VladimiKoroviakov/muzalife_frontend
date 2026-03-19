# Кешування

MuzaLife Frontend використовує `CacheManager` (`src/utils/cache-manager.ts`) — легкий обгортка над `localStorage` з підтримкою TTL.

## Клас `CacheManager`

Повна API-документація: [TypeDoc](/typedoc/).

### `setItem(key, value)`

Зберігає значення без TTL.

```ts
CacheManager.setItem('theme', 'dark');
```

### `getItem(key)`

Повертає збережене значення або `null`.

```ts
const theme = CacheManager.getItem('theme');
```

### `setWithTimestamp(key, value, ttlMs?)`

Зберігає значення разом із міткою часу. Якщо `ttlMs` не вказано, кеш не інвалідується за часом.

```ts
CacheManager.setWithTimestamp('user_profile', profileData, 5 * 60 * 1000); // 5 хв
```

### `isCacheValid(key, ttlMs)`

Повертає `true`, якщо запис існує та TTL не вичерпано.

```ts
if (CacheManager.isCacheValid('user_profile', 5 * 60 * 1000)) {
  return CacheManager.getItem('user_profile');
}
```

### `clearUserCache()`

Видаляє всі записи, що стосуються поточного користувача (`user_*`, `profile`, тощо). Викликається автоматично при `logout`.

```ts
CacheManager.clearUserCache();
```

### `removeItem(key)`

Видаляє конкретний запис.

```ts
CacheManager.removeItem('theme');
```

---

## Ключі кешу

| Ключ | TTL | Опис |
|------|-----|------|
| `user_profile` | 5 хв | Профіль користувача |
| `faqs` | 10 хв | Список FAQ |
| `product_<id>` | 3 хв | Деталі продукту |

---

## Поведінка при виході

При виклику `logout()` через `AuthContext`:

1. JWT видаляється з `localStorage`
2. `CacheManager.clearUserCache()` очищає всі user-специфічні записи
3. Стан `AuthContext` скидається до `null`

Це гарантує, що після виходу наступний користувач не побачить кешовані дані попереднього.
