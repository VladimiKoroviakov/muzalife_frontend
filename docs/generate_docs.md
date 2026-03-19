# MuzaLife Frontend — Documentation Guide

This document explains **how documentation is written**, **which tools are used**, and **how to regenerate the Markdown / HTML reference** from TypeScript source.

---

## Documentation standard

The frontend is written in TypeScript and React.  All public modules, hooks, services and utility classes use **TSDoc** comments (a superset of JSDoc compatible with TypeScript tooling).

### What must be documented

| Artifact | Required tags |
|---|---|
| Module / file | `@fileoverview` (first comment in file), `@module` |
| Exported function / hook | `@param`, `@returns`, `@example` |
| Exported class | Class description + all public methods |
| Public method | `@param`, `@returns`, `@example` |
| TypeScript interface / type | Description for the type and each field |
| Context provider / consumer | Describe the provider's purpose and the hook's usage pattern |

### What to document inside a comment

A good TSDoc comment answers three questions:

1. **What** does this do? (one-sentence summary)
2. **Why** does it exist? (architectural or business reason)
3. **How** is it used? (`@example` block showing typical consumer code)

Example of a well-documented React hook:

```ts
/**
 * Fetches the list of FAQ items from the backend on mount.
 *
 * Business rule: an empty FAQ list is treated as an error, not a valid empty
 * state, because the FAQ section should always have content.
 *
 * @returns An object containing `faqs`, `loading`, and `error` state.
 *
 * @example
 * function FAQsPage() {
 *   const { faqs, loading, error } = useFAQs();
 *   if (loading) return <Spinner />;
 *   if (error)   return <ErrorState error={error} />;
 *   return faqs.map(faq => <Question key={faq.id} {...faq} />);
 * }
 */
export const useFAQs = (): UseFAQsReturn => { ... };
```

---

## Tools

### TypeDoc

**TypeDoc** reads TypeScript source files and generates Markdown (or HTML) documentation from TSDoc / JSDoc comment blocks.

- Config: `typedoc.json` in the project root
- Output: `docs/typedoc/`
- Plugin: `typedoc-plugin-markdown` (produces Markdown instead of HTML for better git-diff readability)

### eslint-plugin-jsdoc

Enforces JSDoc completeness and correctness via ESLint.  Run `npm run lint` to see documentation gaps.

---

## Regenerating the documentation

### Prerequisites

```bash
# Node.js 16+ must be installed
node --version

# Install dev dependencies (includes typedoc)
npm install
```

### Generate Markdown docs

```bash
npm run docs
```

Output is written to `docs/typedoc/`.

### Clean and regenerate

```bash
npm run docs:clean
```

### Check documentation quality (linting)

```bash
npm run lint
```

JSDoc-related warnings indicate missing or incorrect documentation.

---

## Docs folder layout

```
docs/
├── generate_docs.md   ← this file
└── typedoc/           ← Generated Markdown reference (git-ignored)
    ├── modules.md
    ├── context/
    ├── hooks/
    ├── services/
    ├── types/
    └── utils/
```

---

## Keeping documentation up-to-date

Documentation is **not a one-time task**.  The following rules apply to all contributors:

- When you **add** a new exported function, hook, class, or type → add a full TSDoc block.
- When you **change** a function signature → update `@param` / `@returns` tags.
- When you **change business logic** → update the description body.
- Before opening a PR → run `npm run lint` and fix all JSDoc-related warnings.

### Architecture decisions to document

Beyond API docs, major architectural choices should be described in the `@fileoverview` comment of the relevant module:

- **Why a Context was chosen** over prop-drilling (see `AuthContext.tsx`)
- **Why localStorage** is used for caching (see `cache-manager.ts`)
- **Why a hook encapsulates fetching** logic (see `useFAQs.ts`)
- **Component interaction diagrams** (inline ASCII in `@fileoverview`)
