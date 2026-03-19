# Хуки

Усі власні хуки знаходяться в `src/hooks/`. Повна API-документація: [TypeDoc](/typedoc/).

## `useAuth`

Ініціалізує сесію при завантаженні застосунку: зчитує JWT з `localStorage`, відправляє запит до `/auth/profile`, зберігає результат у `AuthContext`.

```ts
// Використовується лише в AuthProvider — не викликайте напряму
const { user, isLoading, error } = useAuth();
```

**Важливо:** захист від подвійного виклику в React StrictMode реалізовано через `useRef`-прапор `hasInitialized`. Ефект спрацьовує лише один раз за lifecycle компонента.

---

## `useAuthContext`

Повертає поточний стан автентифікації з `AuthContext`. Кидає помилку, якщо виклик відбувається поза `AuthProvider`.

```ts
import { useAuthContext } from '../context/AuthContext';

function MyComponent() {
  const { user, login, logout } = useAuthContext();
  // ...
}
```

**Повертає:**

| Поле | Тип | Опис |
|------|-----|------|
| `user` | `AuthUser \| null` | Поточний користувач або `null` |
| `isLoading` | `boolean` | `true` під час ініціалізації сесії |
| `error` | `string \| null` | Помилка автентифікації |
| `login` | `(token, user) => void` | Зберегти сесію |
| `logout` | `() => void` | Очистити сесію та кеш |

---

## `useFAQs`

Завантажує список FAQ з API і кешує результат у `localStorage`.

```ts
const { faqs, isLoading, error } = useFAQs();
```

---

## `useSingleProduct`

Завантажує деталі одного продукту за `id`. Використовує TTL-кеш для уникнення повторних запитів.

```ts
const { product, isLoading, error } = useSingleProduct(productId);
```

---

## `useVerificationCode`

Керує таймером повторного надсилання OTP-коду при верифікації email.

```ts
const { countdown, canResend, resend } = useVerificationCode(email);
```

| Поле | Тип | Опис |
|------|-----|------|
| `countdown` | `number` | Секунди до можливості повторного надсилання |
| `canResend` | `boolean` | `true` коли таймер вичерпано |
| `resend` | `() => Promise<void>` | Відправити новий код |
