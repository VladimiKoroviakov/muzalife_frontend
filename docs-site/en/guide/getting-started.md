# Getting Started

## Requirements

| Tool    | Version |
|---------|---------|
| Node.js | 20.x    |
| npm     | 10+     |
| mkcert  | latest  |

## Installation

```bash
git clone https://github.com/VladimiKoroviakov/muzalife_frontend.git
cd muzalife_frontend
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```bash
VITE_API_URL=https://localhost:5001/api
VITE_APP_NAME=MuzaLife
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_FACEBOOK_APP_ID=your_facebook_app_id_here
```

## HTTPS Setup

OAuth providers (Google, Facebook) require HTTPS. Generate local certificates:

```bash
mkcert -install
mkcert -cert-file localhost.pem -key-file localhost-key.pem localhost 127.0.0.1
```

## Running

```bash
npm run dev        # dev server at https://localhost:3000
npm run build      # production build → build/
npm run type-check # TypeScript check
npm run lint       # ESLint
npm run lint:docs  # TSDoc coverage check
npm run check      # lint + type-check + test:docs (CI gate)
```

## Documentation

```bash
npm run docs        # TypeDoc → docs/typedoc/
npm run test:docs   # living documentation tests
```
