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

Керує станом OTP-коду під час двокрокової реєстрації (відправка коду → верифікація).
