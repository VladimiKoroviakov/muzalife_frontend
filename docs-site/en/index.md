---
layout: home
title: MuzaLife Frontend
hero:
  name: MuzaLife Frontend
  text: React SPA Documentation
  tagline: Documentation for the MuzaLife platform client application
  actions:
    - theme: brand
      text: Getting Started
      link: /en/guide/getting-started
    - theme: alt
      text: Architecture
      link: /en/guide/architecture

features:
  - icon: ⚛️
    title: React 18 + TypeScript
    details: Fully typed SPA with React Router DOM, React Hook Form and Radix UI components.
  - icon: 🔑
    title: Context-based Auth
    details: Centralised AuthContext with JWT stored in localStorage and Google / Facebook OAuth support.
  - icon: 💾
    title: localStorage Caching
    details: CacheManager with TTL validation prevents redundant network requests.
  - icon: 🔬
    title: Living Documentation Tests
    details: Every utility and hook is documented with executable tests in src/tests/docs/.
---

## Project Structure

```
MuzaLife Frontend/
├── src/
│   ├── context/        — React Context (Auth)
│   ├── hooks/          — custom React hooks
│   ├── services/       — HTTP client (api.ts)
│   ├── utils/          — CacheManager and helpers
│   ├── types.ts        — shared TypeScript types
│   └── tests/docs/     — living documentation tests
├── docs/
│   ├── typedoc/        — generated TypeDoc documentation
│   ├── typedoc.zip     — documentation archive
│   └── i18n/           — bilingual documentation
├── docs-site/          — this VitePress site
└── vitest.config.ts    — test configuration
```
