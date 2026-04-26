![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Vite](https://img.shields.io/badge/Vite-6.x-purple)
![Tailwind](https://img.shields.io/badge/Tailwind-4.x-38B2AC)

# MuzaLife Front End

Frontend application for MuzaLife — a modern web experience powered by React and Vite.

This repository contains the source code for the client-side of the MuzaLife project. It provides UI, routing, styles, and integration with the MuzaLife backend API.


## Features

- React 18 (component-based UI)
- Vite 6 development server with HMR
- TypeScript 5 for full type safety
- Tailwind CSS v4 (utility-first, no CSS modules)
- Radix UI primitives for accessible components
- React Router v7 for client-side routing
- React Hook Form for form management
- OAuth integration (Google, Facebook)
- LiqPay payment integration
- Admin panel (orders, materials, analytics, polls)
- Bilingual UI — Ukrainian and English


## Getting Started

Follow these steps to run the frontend locally from a **fresh OS installation**.

### 1. Install Prerequisites

| Tool | Version | Download |
|---|---|---|
| Node.js | v20 LTS | https://nodejs.org |
| npm | comes with Node.js | — |
| Git | latest | https://git-scm.com |
| mkcert *(optional, for HTTPS)* | latest | https://github.com/FiloSottile/mkcert |

> **Windows users:** install Node.js via the official installer or `winget install OpenJS.NodeJS.LTS`.

> **macOS users:** `brew install node mkcert`

> **Linux (Ubuntu/Debian):** `sudo apt install nodejs npm`

> **Important:** The MuzaLife Backend must also be running. See the [backend README](https://github.com/VladimiKoroviakov/muzalife_backend) for setup instructions.

---

### 2. Clone the Repository

```bash
git clone https://github.com/VladimiKoroviakov/muzalife_frontend.git
cd muzalife_frontend
```

---

### 3. Install Dependencies

```bash
npm install
```

---

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# API Base URL — must point to the running backend
VITE_API_URL=https://localhost:5001/api

# Application Name
VITE_APP_NAME=MuzaLife

# OAuth Keys (obtain from Google Cloud Console and Facebook Developer portal)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_FACEBOOK_APP_ID=your_facebook_app_id_here
```

> **Note:** All variables must be prefixed with `VITE_` to be exposed to the browser bundle. Never commit `.env` to version control — it is already in `.gitignore`.

---

### 5. Set Up HTTPS Certificates *(optional but recommended)*

Vite auto-detects `localhost-key.pem` and `localhost.pem` in the project root and enables HTTPS if they are present. Generate them with mkcert:

```bash
# Install mkcert's local CA (one-time)
mkcert -install

# Generate certs for localhost in the project root
mkcert -cert-file localhost.pem -key-file localhost-key.pem localhost 127.0.0.1
```

> Without certificates, the dev server runs on plain HTTP (`http://localhost:3000`). However, OAuth providers (Google, Facebook) require HTTPS for redirect URIs, so HTTPS is strongly recommended.

---

### 6. Run in Development Mode

```bash
npm run dev
```

Vite starts the development server at **https://localhost:3000** (or `http://localhost:3000` if no certs are present) and opens the browser automatically.

Expected output:
```
  VITE v6.x.x  ready in Xms

  ➜  Local:   https://localhost:3000/
  ➜  Network: use --host to expose
```

> Your browser may warn about the self-signed certificate. Accept the exception to proceed.

---

### 7. Verify the Installation

- Navigate to `https://localhost:3000` — the MuzaLife homepage should load.
- Open the browser DevTools → Network tab and confirm API calls to `https://localhost:5001/api` are returning `200 OK`.

---

### 8. Build for Production

```bash
npm run build
```

The production bundle is output to `build/`. Preview it locally with:

```bash
npx vite preview
```


## Project Structure

```
src/
├── assets/             # Static assets (images, icons, fonts)
├── components/
│   ├── admin/          # Admin panel (analytics, orders, materials, polls)
│   ├── auth/           # Route guards (ProtectedRoute, PublicRoute, AdminRoute) + OAuth buttons
│   ├── cabinet/        # User dashboard panels (saved, purchases, orders, settings)
│   ├── common/         # Shared components (ProductCard, SearchBar, etc.)
│   ├── errors/         # Error boundary
│   ├── faqs/           # FAQ components
│   ├── features/       # Cart, FiltersSidebar, GuestCheckoutModal
│   ├── layout/         # Header, ProductsCanvas, DashboardCanvas, SidebarTabs
│   ├── product/        # Product detail components (gallery, actions, info, reviews)
│   └── ui/             # Radix UI primitive wrappers + custom SVG icons
├── config/             # Runtime config + all API endpoint strings
├── constants/          # Cache keys/TTLs, HTTP codes, order statuses & colours
├── context/            # AuthContext — single provider at app root
├── hooks/              # Custom React hooks (useAuth, useFAQs, useSingleProduct, ...)
├── lib/                # cn() class-merge helper
├── pages/              # Route-level components
├── services/
│   └── api/            # HTTP client modules (client, auth, products, orders, payments, ...)
├── styles/             # globals.css
├── tests/
│   └── docs/           # Living-documentation tests (Vitest)
├── types/              # All shared TypeScript types (multi-module, barrel-exported)
├── utils/              # CacheManager (localStorage + TTL), logger
├── App.tsx             # All route definitions
├── main.tsx            # Application entry point (ReactDOM.createRoot)
└── index.css           # Global CSS entry point
```

## Routes

All routes are defined in `src/App.tsx`.

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
| `*` | `NotFoundPage` | — (404 catch-all) |


## NPM Scripts Reference

| Command | Description |
|---|---|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build production bundle to `build/` |
| `npm test` | Run all tests (Vitest) |
| `npm run test:docs` | Run living-documentation tests only |
| `npm run test:coverage` | Run tests with v8 coverage report |
| `npm run lint` | Run ESLint on `src/` |
| `npm run lint:fix` | Run ESLint and auto-fix |
| `npm run lint:docs` | Check TSDoc coverage on all exports |
| `npm run type-check` | TypeScript type-check without emitting |
| `npm run docs` | Generate TypeDoc Markdown → `docs/typedoc/` |
| `npm run docs:clean` | Clean and regenerate TypeDoc |
| `npm run check` | Lint + type-check + test:docs (full CI gate) |


## Configuration

### Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Backend API base URL (e.g. `https://localhost:5001/api`) |
| `VITE_APP_NAME` | No | App display name (default: `MuzaLife`) |
| `VITE_GOOGLE_CLIENT_ID` | No | Google OAuth 2.0 client ID |
| `VITE_FACEBOOK_APP_ID` | No | Facebook App ID for OAuth |


## Documentation

### Documentation Standard

All exported modules, hooks, services, context providers, and utility classes use **TSDoc** comments. Every contributor must follow the same standard so the auto-generated reference stays accurate.

**Minimum required tags for every exported symbol:**

| Tag | Purpose |
|---|---|
| `@fileoverview` + `@module` | File-level description and module name |
| `@param name` | Each function / hook parameter |
| `@returns` | Return value description |
| `@example` | At least one usage example |

### Generating Documentation

```bash
npm run docs        # Generate to docs/typedoc/
npm run docs:clean  # Clean and regenerate
```

### Linting Docs Quality

```bash
npm run lint
```

JSDoc-related warnings indicate missing documentation. Fix all warnings before opening a Pull Request.

### Detailed Guide

See [`docs/generate_docs.md`](./docs/generate_docs.md) for the full documentation guide including TSDoc examples.

---

## Deployment

See [`docs/deployment.md`](./docs/deployment.md) for the production deployment guide.

See [`docs/update.md`](./docs/update.md) for the update and rollback procedures.

See [`docs/backup.md`](./docs/backup.md) for the backup and restore procedures.

---

## Contributing

Contributions are welcome! Follow these steps:
1. Fork it
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

Please make sure your code follows existing style conventions and includes relevant tests when applicable.


## Contact

If you want to reach out:
- GitHub: https://github.com/VladimiKoroviakov
- Email: v.korovyakov@student.sumdu.edu.ua


## License

This project is licensed under the MIT License - see the LICENSE file for details.


## Support

If you found this project useful, give it a ⭐ on GitHub!
