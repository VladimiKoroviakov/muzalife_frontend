# Architecture

## Project Structure

MuzaLife Frontend is a React SPA built with **Vite + TypeScript + Tailwind CSS**. Routing uses `react-router-dom`, UI primitives come from `@radix-ui`, forms from `react-hook-form`.

```
src/
├── components/
│   └── ui/              # shadcn/ui components (Radix-based)
├── context/
│   └── AuthContext/     # Global authentication state
├── hooks/
│   ├── useAuth.ts       # Session initialization on startup
│   ├── useFAQs.ts
│   ├── useSingleProduct.ts
│   └── useVerificationCode.ts
├── pages/               # Page-level components (router level)
├── services/
│   └── api.ts           # Centralized ApiService (singleton)
├── utils/
│   └── cache-manager.ts # localStorage TTL cache
└── types.ts             # Global TypeScript interfaces
```

## Key Architectural Decisions

### Context API Instead of Prop Drilling

`AuthContext` provides authentication state (`user`, `isLoading`, `error`) to the entire component tree without explicit prop passing. Any component can access the session via the `useAuthContext()` hook.

### localStorage Caching

`CacheManager` stores user profile and other responses in `localStorage` with TTL. This enables instant data display on subsequent visits without redundant network requests.

```ts
CacheManager.setWithTimestamp('profile', data, 5 * 60 * 1000); // 5 min TTL
const isFresh = CacheManager.isCacheValid('profile', 5 * 60 * 1000);
```

### React StrictMode Double-Call Protection

`useAuth` uses a `useRef` flag `hasInitialized` to prevent duplicate session initialization in React 18 StrictMode (where effects fire twice in development).

### Singleton ApiService

`apiService` is a single `ApiService` instance that centralizes all HTTP requests, attaches the JWT header, and handles errors in one place.

## Routing

| Route | Component | Auth |
|-------|-----------|------|
| `/` | `HomePage` | Public |
| `/login` | `LoginPage` | Anonymous |
| `/signup` | `SignUpPage` | Anonymous |
| `/product/:id` | `ProductPage` | Public |
| `/cabinet` | `UserCabinet` | JWT |
| `/admin` | `AdminPanel` | JWT + Admin |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Build | Vite 6 + SWC |
| UI | React 18 + TypeScript |
| Styles | Tailwind CSS + shadcn/ui |
| Routing | react-router-dom 7 |
| Forms | react-hook-form |
| OAuth | @react-oauth/google |
| Documentation | TypeDoc + TSDoc |
| Testing | Vitest 4 |
