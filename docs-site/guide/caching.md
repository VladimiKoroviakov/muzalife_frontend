# Кешування

## CacheManager

`CacheManager` (`src/utils/cache-manager.ts`) — утиліта для кешування даних у `localStorage` з перевіркою часу актуальності. Запобігає зайвим мережевим запитам для "гарячих" даних.

```ts
import { CacheManager } from '@/utils/cache-manager';

const cached = CacheManager.get<Product[]>('products');
if (!cached) {
  const data = await apiService.getProducts();
  CacheManager.set('products', data, CACHE_DURATIONS.PRODUCTS);
}
```

## Ключі та TTL

Визначені в `src/constants/cache.ts`:

| Ключ кешу | TTL |
|-----------|-----|
| Продукти | 5 хвилин |
| Опитування | 15 хвилин |
| Персональні замовлення | 20 хвилин |
| Дані користувача | 30 хвилин |
| FAQ | 1 година |

## Інвалідація

Кеш конкретного ключа очищується при мутуючих операціях (створення, оновлення, видалення). Метод `apiService.clearUserData()` очищує всі дані користувача при виході з системи.
