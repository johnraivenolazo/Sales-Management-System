# Sales Management System

Sales Management System for Hope, Inc. built as a sprint-based capstone project.

## Current Status

- Sprint 1 scaffold, auth wiring, and database seed work are in place on `dev`
- Vite + React + Tailwind is set up with `pnpm`
- Supabase JS client bootstrap is ready through `.env.example`
- Email sign-up, email sign-in, Google OAuth, and the login guard are wired
- Sprint 1 auth tests are available through Vitest + React Testing Library

## Tech Stack

- Vite
- React
- Tailwind CSS
- Supabase JavaScript client

## Branch Strategy

The repository follows the workflow required by the project docs:

```text
feature branch -> PR -> dev -> release PR -> main
```

### Branch roles

- `main`
  - release-ready branch
  - only sprint release PRs should merge here
- `dev`
  - integration branch for ongoing sprint work
  - all feature work should merge here first
- `feat/*`, `fix/*`, `db/*`, `test/*`, `docs/*`, `chore/*`
  - task branches created from `dev`
- `release/sprint-N`
  - release branch created from `dev` at sprint end before merging to `main`

### Expected flow

1. Checkout `dev`
2. Pull the latest changes
3. Create a task branch from `dev`
4. Open a PR back to `dev`
5. Merge to `dev`
6. At sprint end, create `release/sprint-N` from `dev`
7. Open a release PR from `release/sprint-N` to `main`

## Getting Started

### Prerequisites

- Node.js
- pnpm

### Clone The Repository

Using SSH:

```bash
git clone git@github.com:johnraivenolazo/Sales-Management-System.git
cd Sales-Management-System
```

Using HTTPS:

```bash
git clone https://github.com/johnraivenolazo/Sales-Management-System.git
cd Sales-Management-System
```

### Install Dependencies

```bash
pnpm install
```

### Environment Setup

Create a local `.env.local` file based on `.env.example`, then update it with
your Supabase values:

```text
VITE_SUPABASE_URL=https://sxtntoyfjzosjfyuqhyt.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Current hosted Supabase project URL reference:

```text
https://sxtntoyfjzosjfyuqhyt.supabase.co
```

Do not commit real secrets or local environment files.

### Development

```bash
pnpm dev
```

The local Vite app runs on:

```text
http://localhost:5173
```

### Verification

```bash
pnpm build
pnpm lint
pnpm test
```

### Sprint 1 Auth Notes

- Email registration is part of Sprint 1.
- Google OAuth is part of Sprint 1.
- New users are provisioned into the app database as `USER / INACTIVE`.
- The login guard allows `ACTIVE` users into protected routes and returns
  `INACTIVE` users to the login flow until a Sales Manager activates them.

## Project Routes

Current placeholder routes already wired:

- `/sales`
- `/sales/:transNo`
- `/lookups/customers`
- `/lookups/employees`
- `/lookups/products`
- `/lookups/prices`
- `/reports`
- `/admin`
- `/deleted-items`
- `/auth/callback`
- `/login`

## Project Docs

Key docs currently tracked in the repo:

- `docs/db-erd.md`
- `docs/auth-google-setup.md`
- `docs/sprint-1-log.md`

## Notes

- Supabase CLI is not required for the current frontend scaffold
- If you want to use Supabase CLI locally later, install and link it separately
- Current deployed app URL:
  - `https://sales-management-system-project.vercel.app`
