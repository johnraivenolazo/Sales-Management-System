# Sales Management System

Sales Management System for Hope, Inc. built as a sprint-based capstone project.

## Current Status

- Sprint 1 M1 scaffold is in place
- Vite + React + Tailwind is set up with `pnpm`
- Supabase JS client bootstrap is ready through `.env.example`
- Protected route skeleton and placeholder pages are wired

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

### Installation

```bash
pnpm install
```

Create a local `.env` file based on `.env.example`, then update it with your
Supabase values:

```text
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### Development

```bash
pnpm dev
```

### Verification

```bash
pnpm build
pnpm lint
```

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

See the internal project references in `project_docs/`:

- development guide summary
- sprint deliverables
- task summary
- release PR templates

## Notes

- Supabase CLI is not required for the current frontend scaffold
- If you want to use Supabase CLI locally later, install and link it separately
