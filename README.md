<div align="center">
  <img src="public/logo.png" alt="Sales Management System logo" width="92" />
  <h1>Sales Management System</h1>
  <p>Sales, sales detail, lookup, reporting, admin activation, and recovery workflows for Hope, Inc.</p>
</div>

## Overview

This project is a sprint-based capstone application built for Hope, Inc. It uses React, Vite, Tailwind CSS, and Supabase to manage:

- sales transactions
- sales detail line items
- lookup-only reference data
- admin user activation
- deleted-item recovery
- rights-based access control
- reporting views

The app supports both email/password sign-in and Google OAuth, with account activation enforced through the application rights model.

## Live Application

- Production URL: `https://sales-management-system-project.vercel.app`
- Production auth callback: `https://sales-management-system-project.vercel.app/auth/callback`
- Sprint board: `https://github.com/users/johnraivenolazo/projects/8`

## Quick Links

- Live site: [sales-management-system-project.vercel.app](https://sales-management-system-project.vercel.app)
- Sprint board: [Sprint Board](https://github.com/users/johnraivenolazo/projects/8)
- Production deploy checklist: [docs/production-deploy-checklist.md](docs/production-deploy-checklist.md)
- Sprint 3 rights production checklist: [docs/sprint-3-rights-production.md](docs/sprint-3-rights-production.md)

## Tech Stack

- React 18
- Vite
- Tailwind CSS 4
- Supabase JavaScript client
- Vitest + React Testing Library
- Playwright
- Motion
- Lucide React

## Core Modules

### Transactions

- create, edit, soft-delete, recover, and view sales transactions
- filter by query, customer, date range, and status
- role-aware visibility for active and inactive records

### Sales Detail

- add, edit, soft-delete, recover, and view line items
- current price lookup integration
- hidden inactive detail rows for non-admin users

### Lookups

- customers
- employees
- products
- prices

These pages are intentionally read-only.

### Reports

- sales by employee
- sales by customer
- top products sold
- monthly sales trend

### Admin

- user search and filtering
- activate and deactivate accounts
- SUPERADMIN rows remain visible but locked

### Deleted Items

- recover inactive sales
- recover inactive sales detail rows
- restricted to admin-capable roles

## Authentication And Access Model

- Email/password sign-up and sign-in are supported.
- Google OAuth is supported through Supabase.
- New accounts are provisioned as `USER / INACTIVE`.
- Inactive accounts are blocked from protected routes until activated.
- Rights determine whether create, edit, delete, admin, deleted-items, and lookup actions are visible.

## Database Summary

Business tables:

- `employee`
- `customer`
- `sales`
- `product`
- `salesDetail`
- `priceHist`

Rights-side tables:

- `user`
- `module`
- `rights`
- `user_module`
- `user_module_rights`

Highlights:

- only `sales` and `salesDetail` are structurally extended within the HopeDB business tables with `record_status` and `stamp`
- lookup tables use SELECT-only RLS
- soft-delete cascades from `sales` to `salesDetail`
- recovery restores both parent and child records
- admin-facing user management is guarded by RLS and a SUPERADMIN protection trigger

## Project Routes

- `/login`
- `/register`
- `/auth/callback`
- `/sales`
- `/sales/:transNo`
- `/lookups/customers`
- `/lookups/employees`
- `/lookups/products`
- `/lookups/prices`
- `/reports`
- `/admin`
- `/deleted-items`

## Getting Started

### Prerequisites

- Node.js
- pnpm
- a Supabase project

### Install

```bash
pnpm install
```

### App Environment

Create `.env.local` from `.env.example`:

```text
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Run The App

```bash
pnpm dev
```

Default local URL:

```text
http://localhost:5173
```

## Database Setup

Run the SQL migrations in order from:

- [db/migrations](db/migrations)

Current migration set:

1. `001_initial_schema.sql`
2. `002_rights_seed.sql`
3. `003_trigger_provision_user.sql`
4. `004_rls_sales.sql`
5. `005_rls_salesdetail.sql`
6. `006_rls_lookup_tables.sql`
7. `007_trigger_cascade_sales.sql`
8. `008_views_sales_lookup.sql`
9. `009_views_reports_3.sql`
10. `010_rls_admin_superadmin_guard.sql`

Verification scripts:

- [001_seed_verification.sql](db/verification/001_seed_verification.sql)
- [002_sprint2_m3_verification.sql](db/verification/002_sprint2_m3_verification.sql)
- [003_sprint3_m3_verification.sql](db/verification/003_sprint3_m3_verification.sql)
- [004_final_db_backup_log.md](db/verification/004_final_db_backup_log.md)

## Testing

### Lint

```bash
pnpm lint
```

### Unit And Integration Tests

```bash
pnpm test
```

### Production Build

```bash
pnpm build
```

### Playwright E2E

Create `.env.e2e.local` from `.env.e2e.example`:

```text
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4173
E2E_USER_EMAIL=user@gmail.com
E2E_ADMIN_EMAIL=admin@gmail.com
E2E_SUPERADMIN_EMAIL=adminsuper@gmail.com
E2E_AUTH_PASSWORD=12345678
```

Run:

```bash
pnpm test:e2e
```

Optional:

```bash
pnpm test:e2e:headed
pnpm test:e2e:ui
```

## Docs Index

### Architecture And Setup

- [Database ERD](docs/db-erd.md)
- [Google OAuth Setup](docs/auth-google-setup.md)
- [Production Deploy Checklist](docs/production-deploy-checklist.md)
- [Final RLS Audit](docs/final-rls-audit.md)

### Sprint Logs And Verification

- [Sprint 1 Gate Checklist](docs/sprint-1-gate-checklist.md)
- [Sprint 1 Log](docs/sprint-1-log.md)
- [Sprint 2 Rights Matrix](docs/sprint-2-rights-matrix.md)
- [Sprint 2 Cascade Visibility](docs/sprint-2-cascade-visibility.md)
- [Sprint 2 Lookup Price Autofill](docs/sprint-2-lookup-price-autofill.md)
- [Sprint 2 Log](docs/sprint-2-log.md)
- [Sprint 3 Rights Production Checklist](docs/sprint-3-rights-production.md)

## Repository Workflow

Expected branch flow:

```text
task branch -> pull request -> dev -> release branch -> main
```

Branch roles:

- `dev` for active sprint integration
- `main` for release-ready code
- `feat/*`, `fix/*`, `db/*`, `test/*`, `docs/*`, `chore/*` for task work
- `release/sprint-N` for sprint releases

## Notes

- Do not commit real Supabase keys or local environment files.
- Google OAuth production verification still requires a live deployed check.
- Some final deliverables such as the user manual, sprint log packaging, and presentation materials are maintained separately from core code implementation.
