---
layout: home
title: MuzaLife Frontend
hero:
  name: MuzaLife Frontend
  text: React SPA Documentation
  tagline: Документація клієнтського додатку платформи MuzaLife
  actions:
    - theme: brand
      text: Початок роботи
      link: /guide/getting-started
    - theme: alt
      text: TypeDoc API
      link: /typedoc/

features:
  - icon: ⚛️
    title: React 18 + TypeScript
    details: Повністю типізований SPA з React Router DOM, React Hook Form і Radix UI компонентами.
  - icon: 🔑
    title: Context-based Auth
    details: Централізований AuthContext з JWT зберіганням у localStorage та підтримкою Google / Facebook OAuth.
  - icon: 💾
    title: Кешування у localStorage
    details: CacheManager із перевіркою часу актуальності запобігає зайвим мережевим запитам.
  - icon: 🔬
    title: Живі тести-документація
    details: Кожен утиліт та хук задокументований виконуваними тестами у src/tests/docs/.
---

## Структура проєкту

```
MuzaLife Frontend/
├── src/
│   ├── components/     — UI компоненти (admin, auth, cabinet, layout, product, ui, ...)
│   ├── config/         — runtime конфіг та всі API ендпоінти
│   ├── constants/      — HTTP-коди, статуси замовлень, ключі кешу
│   ├── context/        — React Context (AuthContext)
│   ├── hooks/          — кастомні React хуки (7 хуків)
│   ├── pages/          — компоненти маршрутів (11 сторінок + 404)
│   ├── services/api/   — HTTP-клієнт (мульти-модульний, синглтон apiService)
│   ├── utils/          — CacheManager, logger
│   ├── types/          — спільні TypeScript типи (мульти-модульний barrel-export)
│   └── tests/docs/     — living documentation тести (Vitest)
├── docs/
│   ├── typedoc/        — згенерована TypeDoc документація
│   ├── i18n/           — документація двома мовами
│   └── scripts/        — shell-скрипти для розгортання та бекапу
├── docs-site/          — цей VitePress сайт
└── vitest.config.ts    — конфігурація тестів
```
