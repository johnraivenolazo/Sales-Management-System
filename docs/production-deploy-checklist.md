# Production Deploy Checklist

Sprint 3 M1 reference for final deployment verification before the release branch is cut.

## Live app

- Production URL: `https://sales-management-system-project.vercel.app`
- Expected auth callback route: `https://sales-management-system-project.vercel.app/auth/callback`

## Required Vercel environment variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Required Supabase auth configuration

Authentication -> URL Configuration:

- Site URL:
  - `https://sales-management-system-project.vercel.app`
- Additional Redirect URLs:
  - `http://localhost:5173/auth/callback`
  - `https://sales-management-system-project.vercel.app/auth/callback`

## Required Google OAuth configuration

Google Cloud Console OAuth client:

- Authorized redirect URI:
  - `https://sxtntoyfjzosjfyuqhyt.supabase.co/auth/v1/callback`

## Deployment checks

- [ ] Vercel build succeeds from the current `dev` branch
- [ ] Direct visits to `/sales`, `/sales/TR000001`, `/admin`, and `/auth/callback` resolve correctly
- [ ] Email sign-in works in production
- [ ] Google OAuth works in production
- [ ] Supabase production project matches the deployed frontend environment variables
- [ ] The live app can load Sales, Sales Detail, lookup pages, and Deleted Items without missing environment errors

## Release-ready note

Per the project docs, deployment verification does not replace the required release flow:

- task branches -> PR -> `dev`
- `release/sprint-N` created from `dev`
- release PR from `release/sprint-N` -> `main`
- all 5 members review before merge
