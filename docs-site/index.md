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
│   ├── context/        — React Context (Auth)
│   ├── hooks/          — кастомні React хуки
│   ├── services/       — HTTP-клієнт (api.ts)
│   ├── utils/          — CacheManager та інше
│   ├── types.ts        — спільні TypeScript типи
│   └── tests/docs/     — living documentation тести
├── docs/
│   ├── typedoc/        — згенерована TypeDoc документація
│   ├── typedoc.zip     — архів документації
│   └── i18n/           — документація двома мовами
├── docs-site/          — цей VitePress сайт
└── vitest.config.ts    — конфігурація тестів
```
