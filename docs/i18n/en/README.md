# MuzaLife Frontend — Documentation (English)

> This folder contains documentation in English.
> Ukrainian version is at `docs/i18n/uk/`.

## Contents

- [Documentation Standards](#documentation-standards)
- [Architecture](#architecture)
- [Key Modules](#key-modules)
- [Tooling](#tooling)
- [Contributing](#contributing)

---

## Documentation Standards

| Level | Standard | Tool |
|-------|----------|------|
| Module / file | TSDoc `@fileoverview` | TypeDoc |
| Function / hook | TSDoc `@param`, `@returns`, `@example` | TypeDoc |
| Interface / type | TSDoc field descriptions | TypeDoc |
| Quality | eslint-plugin-jsdoc | ESLint |
| Living examples | Vitest living docs | Vitest |

---

## Architecture

```
src/
├── context/
│   └── AuthContext.tsx      — global auth state (Context API)
├── hooks/
│   ├── useAuth.ts           — profile loading, StrictMode dedup via useRef
│   ├── useFAQs.ts           — FAQ fetching; empty array treated as error
│   ├── useSingleProduct.ts  — product-by-ID with refetch pattern
│   └── useVerificationCode.ts — OTP form management
├── services/
│   └── api.ts               — single HTTP client (JWT + CacheManager)
├── utils/
│   └── cache-manager.ts     — localStorage cache with timestamp validation
└── types.ts                 — shared TypeScript types
```

---

## Key Modules

### CacheManager (`src/utils/cache-manager.ts`)

```typescript
CacheManager.setWithTimestamp('cachedProducts', products);

if (CacheManager.isCacheValid('cachedProducts', 5 * 60 * 1000)) {
  return CacheManager.getItem<Product[]>('cachedProducts');
}

CacheManager.clearUserCache(); // call on sign-out
```

### AuthContext (`src/context/AuthContext.tsx`)

```typescript
const { user, token, isAuthenticated, login, logout } = useAuthContext();
```

---

## Tooling

```bash
npm run docs          # TypeDoc → docs/typedoc/ (Markdown)
npm run docs:clean    # clean and regenerate
npm run docs:archive  # create docs/typedoc.zip
npm run test:docs     # living-documentation tests
```

---

## Contributing

1. Every hook and utility must have `@fileoverview` and TSDoc on public functions
2. New types/interfaces in `types.ts` must document each field
3. New utilities must have a corresponding test in `src/tests/docs/`
