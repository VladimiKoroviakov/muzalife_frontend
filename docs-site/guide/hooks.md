# Хуки

Кастомні хуки знаходяться в `src/hooks/`. Повні сигнатури та приклади — у [TypeDoc API](/typedoc/).

## useAuth

```ts
import { useAuth } from '@/hooks/useAuth';
```

Центральний хук автентифікації. Повертає стан авторизації та всі методи роботи з нею.

```ts
const {
  user,                  // AuthUser | null
  isLoading,             // boolean
  error,                 // string | null
  signInWithEmail,       // (email, password, type) => Promise<void>
  signUpWithEmail,       // (email, password, name) => Promise<void>
  completeRegistration,  // (email, password, name, code) => Promise<void>
  signInWithOAuth,       // (provider, accessToken) => Promise<void>
  signOut,               // () => void
} = useAuth();
```

Використовується через `useAuthContext()` — не викликайте `useAuth()` напряму поза `AuthContext`.

## useFAQs

```ts
import { useFAQs } from '@/hooks/useFAQs';
```

Отримує список питань FAQ з API. Результати кешуються на 1 годину.

```ts
const { faqs, loading, error } = useFAQs();
```

## useSingleProduct

```ts
import { useSingleProduct } from '@/hooks/useSingleProduct';
```

Завантажує деталі продукту та відгуки за `id`.

```ts
const {
  product,        // Product | null
  reviews,        // Review[]
  galleryImages,  // string[]
  loading,        // boolean
  error,          // string | null
  refetch,        // () => void
} = useSingleProduct(id);
```

## useVerificationCode

```ts
import { useVerificationCode } from '@/hooks/useVerificationCode';
```

Керує станом OTP-коду під час двокрокової реєстрації або гостьової верифікації (відправка коду → підтвердження).

```ts
const {
  code,          // string — поточне значення поля вводу
  isLoading,     // boolean
  error,         // string | null
  sendCode,      // (email: string) => Promise<void>
  verifyCode,    // (email: string, code: string) => Promise<void>
} = useVerificationCode();
```

## useProductMetadata

```ts
import { useProductMetadata } from '@/hooks/useProductMetadata';
```

Завантажує довідникові дані для фільтрів: типи продуктів, вікові категорії та події. Використовується у `FiltersSidebar` та адмін-формах.

```ts
const {
  productTypes,    // ProductType[]
  ageCategories,   // AgeCategory[]
  events,          // Event[]
  isLoading,       // boolean
  error,           // string | null
} = useProductMetadata();
```

## useAdminPolls

```ts
import { useAdminPolls } from '@/hooks/useAdminPolls';
```

Адмін-хук для керування опитуваннями: завантаження списку, створення та видалення.

```ts
const {
  polls,          // Poll[]
  isLoading,      // boolean
  error,          // string | null
  createPoll,     // (data: CreatePollData) => Promise<void>
  deletePoll,     // (id: number) => Promise<void>
  refetch,        // () => void
} = useAdminPolls();
```

## useAdminAnalytics

```ts
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
```

Адмін-хук для статистики продуктів: кількість продажів, доходи, фільтрація за датою.

```ts
const {
  analytics,      // AnalyticsData | null
  isLoading,      // boolean
  error,          // string | null
  fetchAnalytics, // (params: AnalyticsParams) => Promise<void>
} = useAdminAnalytics();
```
