# Architecture

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 18 + TypeScript 5 |
| Build Tool | Vite 6 (SWC) |
| Routing | React Router v7 |
| State | React Context API |
| Styling | Tailwind CSS 4 + Radix UI |
| Testing | Vitest |

## Routing

All routes are defined in `src/App.tsx` via `BrowserRouter`. Access is controlled by three guard components:

| Component | Access condition | Redirect |
|-----------|-----------------|----------|
| `ProtectedRoute` | User is authenticated | `/login` |
| `PublicRoute` | User is **not** authenticated | `/` |
| `AdminRoute` | `user.is_admin === true` | `/` |

## State Management

The app uses React Context API exclusively — no Redux or Zustand.

`AuthContext` (`src/context/AuthContext.tsx`) is the single provider at the app root. It exposes:
- the current user (`user`) and loading state
- methods: `signInWithEmail`, `signUpWithEmail`, `signInWithOAuth`, `completeRegistration`, `signOut`

Consumed via the `useAuth()` hook (`src/hooks/useAuth.ts`).

## API Layer

`ApiService` (`src/services/api.ts`) is a singleton class with a private `http<T>()` method that:
- automatically attaches `Authorization: Bearer` from `localStorage['authToken']`
- eagerly parses responses as JSON
- throws an `Error` with the server's `error` field on non-OK status codes

All endpoints are defined in `src/config/index.ts`. Use the exported `apiService` instance — never instantiate the class directly.

## Component Structure

```
src/
├── pages/          — page-level route components
├── components/
│   ├── layout/     — shared layout (DashboardHeader, DashboardRightSide)
│   ├── auth/       — route guards, OAuth buttons
│   ├── cabinet/    — user dashboard components
│   ├── admin/      — admin panel components
│   ├── ui/         — Radix UI primitives (69 components)
│   └── ...
├── context/        — React Context providers
├── hooks/          — custom React hooks
├── services/       — HTTP client
├── utils/          — CacheManager and utilities
└── types.ts        — shared TypeScript types
```

## Path Alias

`@/` resolves to `src/`. Use it for all internal imports.

## Chunk Splitting

Vite splits vendor code into separate chunks: `vendor-react`, `vendor-charts`, `vendor-radix`, `vendor-utils`.
