---
layout: home
title: MuzaLife Frontend
hero:
  name: MuzaLife Frontend
  text: React SPA Documentation
  tagline: Client-side documentation for the MuzaLife platform
  actions:
    - theme: brand
      text: Getting Started
      link: /en/guide/getting-started
    - theme: alt
      text: TypeDoc API
      link: /typedoc/

features:
  - icon: ⚛️
    title: React 18 + TypeScript
    details: Fully typed SPA with React Router v7, React Hook Form, and Radix UI components.
  - icon: 🔑
    title: Context-based Auth
    details: Centralised AuthContext with JWT storage in localStorage and Google / Facebook OAuth support.
  - icon: 💾
    title: localStorage Caching
    details: CacheManager with TTL validation prevents unnecessary network requests.
  - icon: 🔬
    title: Living Documentation Tests
    details: Every utility and hook is documented with executable Vitest tests in src/tests/docs/.
---

## Project Structure

```
MuzaLife Frontend/
├── src/
│   ├── components/     — UI components (admin, auth, cabinet, layout, product, ui, ...)
│   ├── config/         — runtime config and all API endpoint strings
│   ├── constants/      — HTTP codes, order statuses, cache keys
│   ├── context/        — React Context (AuthContext)
│   ├── hooks/          — custom React hooks (7 hooks)
│   ├── pages/          — route-level components (11 pages + 404)
│   ├── services/api/   — HTTP client (multi-module, apiService singleton)
│   ├── utils/          — CacheManager, logger
│   ├── types/          — shared TypeScript types (multi-module barrel-export)
│   └── tests/docs/     — living documentation tests (Vitest)
├── docs/
│   ├── typedoc/        — auto-generated TypeDoc reference
│   ├── i18n/           — documentation in two languages
│   └── scripts/        — shell scripts for deployment and backup
├── docs-site/          — this VitePress site
└── vitest.config.ts    — test configuration
```
