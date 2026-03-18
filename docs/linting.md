# Linting Guide — MuzaLife Frontend

## Обраний лінтер та причини вибору

**ESLint v9.39.4** з flat-config (`eslint.config.js`) — стандарт де-факто для TypeScript/React-проєктів.

Додаткові плагіни:
- `typescript-eslint` — правила для TypeScript (no-explicit-any, no-unused-vars тощо)
- `eslint-plugin-react` — специфічні правила для JSX/React (jsx-key, no-unescaped-entities)
- `eslint-plugin-react-hooks` — контроль правил хуків (rules-of-hooks, exhaustive-deps)
- `eslint-plugin-react-refresh` — попередження про проблеми з Fast Refresh (HMR)

Причини вибору:
- Вбудована підтримка TypeScript через `typescript-eslint`
- Широка екосистема плагінів для React
- Flat-config (ESLint v9) є сучасним стандартом налаштування
- Інтеграція з Vite та pre-commit хуками

---

## Базові правила та їх пояснення

| Правило | Рівень | Пояснення |
|--------|--------|-----------|
| `@typescript-eslint/no-unused-vars` | error | Невикористовувані змінні засмічують код; іменування з `_` дозволяє явно позначити навмисне ігнорування |
| `@typescript-eslint/no-explicit-any` | warn | `any` обходить систему типів TypeScript; краще використовувати конкретні типи |
| `react-hooks/rules-of-hooks` | error | Хуки не можна викликати умовно або в циклах |
| `react-hooks/exhaustive-deps` | warn | Відсутні залежності в `useEffect` можуть спричинити баги |
| `react/jsx-key` | error | Відсутній `key` у списках призводить до проблем із React reconciliation |
| `eqeqeq` | error | Завжди використовувати `===` замість `==` для уникнення помилок приведення типів |
| `no-console` | warn | `console.log` не повинен потрапляти у production-код |
| `prefer-const` | error | `const` чіткіше виражає намір, ніж `let` для незмінних значень |
| `no-var` | error | `var` має небажану поведінку hoisting; завжди використовувати `let`/`const` |
| `quotes` | error | Одинарні лапки — єдиний стандарт у проєкті |
| `eol-last` | error | Файл має закінчуватися порожнім рядком (стандарт POSIX) |
| `no-trailing-spaces` | error | Зайві пробіли в кінці рядків засмічують diff |
| `semi` | error | Крапки з комою обов'язкові |
| `curly` | error | Фігурні дужки обов'язкові для всіх блоків `if`/`else`/`for` |
| `object-shorthand` | error | `{ foo }` замість `{ foo: foo }` — скорочений синтаксис об'єктів |
| `arrow-parens` | error | Дужки обов'язкові навколо аргументів стрілкових функцій |
| `preserve-caught-error` (вбудоване) | error | `throw new Error(msg)` у catch-блоці має включати `{ cause: error }` |

---

## Ігнорування файлів

`.eslintignore`:
```
node_modules/
build/
dist/
*.min.js
vite-env.d.ts
```

---

## Інструкція з запуску лінтера

```bash
# Перевірка коду (тільки звіт)
npm run lint

# Автоматичне виправлення помилок
npm run lint:fix

# Статична типізація (TypeScript)
npm run type-check

# Комплексна перевірка: лінтинг + типізація
npm run check
```

---

## Git Hooks

Налаштовано за допомогою **Husky v9** + **lint-staged v16**.

При кожному `git commit` автоматично запускається ESLint на staged-файлах:

```
.husky/pre-commit → npx lint-staged → eslint src/**/*.{ts,tsx}
```

Якщо lint-staged знаходить помилки, коміт зупиняється. Якщо є автовиправлення — виправляє та продовжує.

Конфігурація у `package.json`:
```json
"lint-staged": {
  "src/**/*.{ts,tsx}": [
    "eslint --fix",
    "eslint"
  ]
}
```

---

## Інтеграція з процесом збірки

Скрипт `check` можна використовувати у CI/CD-пайплайні:

```bash
npm run check   # lint + type-check
npm run build   # збірка Vite
```

---

## Статична типізація (TypeScript)

Проєкт вже використовує TypeScript з `"strict": true` у `tsconfig.json`, що вмикає:
- `strictNullChecks` — запобігає `null`/`undefined` помилкам
- `strictFunctionTypes` — строга перевірка сигнатур функцій
- `noImplicitAny` — заборона неявного `any`

Перевірка типів виконується командою:
```bash
npm run type-check   # tsc --noEmit
```

---

## Результати першого запуску

Проаналізовано файлів: **~90 (src/)**

| Показник | Значення |
|---------|---------|
| Початкова кількість проблем | **2503 (2335 помилок, 168 попереджень)** |
| Автоматично виправлено (`--fix`) | **2300** |
| Виправлено вручну | **34** |
| Залишилось (попередження) | **169** |
| **Відсоток виправлених** | **93.2%** |

Топ порушень (до виправлення):

| Правило | Кількість |
|--------|----------|
| `quotes` (подвійні замість одинарних) | 1314 |
| `no-trailing-spaces` | 782 |
| `eol-last` | 100 |
| `no-console` | 96 |
| `@typescript-eslint/no-explicit-any` | 58 |
| `arrow-parens` | 57 |
| `curly` | 41 |
| `@typescript-eslint/no-unused-vars` | 26 |

Після виправлення: `npm run lint` повертає **0 errors**.
