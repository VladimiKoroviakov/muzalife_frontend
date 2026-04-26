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

All routes are defined in `src/App.tsx`. Access is controlled by three guard components:

| Component | Access condition | Redirect |
|-----------|-----------------|----------|
| `ProtectedRoute` | User is authenticated | `/login` |
| `PublicRoute` | User is **not** authenticated | `/` |
| `AdminRoute` | `user.is_admin === true` | `/` |

### Route Table

| Path | Component | Guard |
|------|-----------|-------|
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

## State Management

The app uses React Context API exclusively — no Redux or Zustand.

`AuthContext` (`src/context/AuthContext.tsx`) is the single provider at the app root. It exposes:
- the current user (`user`) and loading state
- methods: `signInWithEmail`, `signUpWithEmail`, `signInWithOAuth`, `completeRegistration`, `signOut`

Consumed via the `useAuth()` hook (`src/hooks/useAuth.ts`).

## API Layer

The HTTP client is split into domain modules under `src/services/api/`:

| Module | Purpose |
|--------|---------|
| `client.ts` | Base `ApiClient` — JWT lifecycle, auto-headers, error handling |
| `auth.ts` | Login, registration, OAuth, guest verification |
| `profile.ts` | User profile CRUD, avatar upload |
| `products.ts` | Product catalog, search, saved products |
| `orders.ts` | Personal orders lifecycle |
| `payments.ts` | LiqPay checkout integration |
| `polls.ts` | Poll voting and results |
| `reviews.ts` | Product review CRUD |
| `faqs.ts` | FAQ retrieval |
| `admin.ts` | Admin: orders, materials, analytics |
| `index.ts` | Merges all modules into the `apiService` singleton |

All endpoints are defined in `src/config/index.ts`. Use only the exported `apiService` — never instantiate `ApiClient` directly.

## Component Structure

```
src/
├── pages/              — page-level route components
├── components/
│   ├── admin/          — admin panel (analytics, orders, materials, polls)
│   ├── auth/           — route guards, OAuth buttons
│   ├── cabinet/        — user dashboard (saved, purchases, orders, settings)
│   ├── common/         — shared components (ProductCard, SearchBar, Logo, ...)
│   ├── errors/         — ErrorBoundary
│   ├── faqs/           — FAQ components
│   ├── features/       — Cart, FiltersSidebar, GuestCheckoutModal
│   ├── layout/         — Header, ProductsCanvas, DashboardCanvas, SidebarTabs
│   ├── product/        — product detail (gallery, actions, info, reviews)
│   └── ui/             — Radix UI primitives + custom SVG icons
├── context/            — React Context providers
├── hooks/              — custom React hooks
├── services/api/       — HTTP client (multi-module)
├── utils/              — CacheManager and logger
└── types/              — shared TypeScript types (multi-module barrel-export)
```

## Path Alias

`@/` resolves to `src/`. Use it for all internal imports.

## Chunk Splitting

Vite splits vendor code into separate chunks: `vendor-react`, `vendor-charts`, `vendor-radix`, `vendor-utils`.
