# Sprint 1 Log

## Sprint Window

- Start: April 3, 2026
- Latest update in this log: April 4, 2026

## Completed Work

### April 3, 2026

- M1 scaffolded the project with Vite, React, Tailwind, Supabase bootstrap,
  route wiring, and branch protection.
- M2 delivered the login page, register page, app shell, and auth callback UI.
- M3 prepared the database schema migration, rights seed migration, ERD, and
  verification queries for the hosted Supabase project.
- M4 delivered auth context wiring, email auth actions, Google OAuth wiring,
  and the provisioning trigger migration for new users.

### April 4, 2026

- Hosted Supabase SQL was applied manually and verified against the expected
  Sprint 1 row counts.
- The auth flow was validated against the hosted Supabase project, including
  Google OAuth callback handling and the inactive-user login guard.
- Vercel SPA routing support was added so client-side routes such as `/sales`
  and `/auth/callback` can resolve after deployment.
- M5 added Sprint 1 auth flow tests with Vitest and React Testing Library.
- README setup instructions were updated for cloning, environment setup, local
  development, and verification commands.

## Blockers

- Docker Desktop was not available for a local Supabase stack, so local CLI
  database testing could not be used for Sprint 1.
- The Vercel production branch initially pointed to `main`, which served an
  older pre-auth build instead of the latest `dev` state.
- The app-side user lookup initially queried `userId`, but the actual seeded
  PostgreSQL column name is `userid`.

## Resolutions

- The team used a hosted Supabase project instead of waiting on Docker, then
  ran the Sprint 1 SQL migrations and verification queries manually in the SQL
  editor.
- Vercel SPA rewrites were added and the deployment configuration was aligned
  with the Sprint 1 auth callback routes.
- The auth lookup was corrected to `userid`, which allowed the app to resolve
  provisioned users properly after OAuth sign-in.

## Sprint 1 Gate Evidence

- Hosted database row counts matched the expected seed totals:
  - `employee = 32`
  - `customer = 82`
  - `sales = 124`
  - `product = 57`
  - `salesDetail = 313`
  - `priceHist = 79`
- Rights seed totals matched the expected Sprint 1 setup:
  - `user = 1`
  - `module = 4`
  - `rights = 13`
  - `user_module = 4`
  - `user_module_rights = 13`
- Foreign-key verification queries returned `0` missing references on the
  checked relations.
- Email and Google auth both reach the shared auth flow, and the login guard
  keeps newly provisioned `INACTIVE` users out of protected routes until
  activation.

## Next Goals

- Start Sprint 2 API integration for `sales` and `salesDetail`.
- Build CRUD screens on top of the Sprint 1 auth and routing foundation.
- Introduce role-driven rights enforcement and RLS in the next database pass.
- Replace placeholder route content with working business workflows.
