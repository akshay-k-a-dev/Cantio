# Contributing to Cantio

Thanks for taking the time to contribute! 🎵

## Project layout

```
vercel-serverless/
  backend/    # Fastify API + Prisma (Node / TypeScript)
  frontend/   # React + Vite + Tailwind (TypeScript)
desktop-app/  # Electron wrapper
mobile-app/   # React Native app
```

## Getting started

### Prerequisites

- Node.js ≥ 20
- pnpm or npm

### Frontend

```bash
cd vercel-serverless/frontend
npm install
npm run dev          # http://localhost:5173
```

### Backend

```bash
cd vercel-serverless/backend
npm install
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npx prisma migrate dev
npm run dev            # http://localhost:3000
```

## Workflow

1. **Fork** the repo and create a branch from `main`.
2. Keep branches focused — one feature or fix per PR.
3. Write clear commit messages (see below).
4. Open a **Pull Request** against `main` with a short description of the change.

## Commit style

```
type: short description

feat:     new feature
fix:      bug fix
refactor: code change that adds no feature / fixes no bug
style:    formatting only
docs:     documentation only
chore:    build, deps, config
```

## Code guidelines

- TypeScript everywhere — no `any` unless genuinely unavoidable.
- Tailwind for styles — avoid inline `style` props.
- Do not commit `.env` files or secrets.
- Do not modify files inside `vercel-serverless/` and `desktop-app/` unless the change is directly related to the issue you are fixing.

## Reporting bugs

Open a [GitHub Issue](https://github.com/akshay-k-a-dev/Cantio/issues) with:

- Steps to reproduce
- Expected vs actual behaviour
- Browser / OS / app version

## Questions

Open a discussion on GitHub or reach out via Issues.
