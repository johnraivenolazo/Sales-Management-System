# Google OAuth Setup

Sprint 1 M4 reference for wiring Google OAuth with the current Supabase project.

## Supabase Dashboard

Use these values in `Authentication -> URL Configuration`:

- Site URL: `https://sales-management-system-project.vercel.app`
- Additional Redirect URL: `http://localhost:5173/auth/callback`
- Additional Redirect URL: `https://sales-management-system-project.vercel.app/auth/callback`

## Google Cloud Console

Use the Supabase callback URL as an authorized redirect URI for the Google OAuth client:

- `https://sxtntoyfjzosjfyuqhyt.supabase.co/auth/v1/callback`

## App Notes

- The frontend sends both Google sign-in buttons to `/auth/callback`.
- `/auth/callback` is handled in the app before redirecting the user to `/sales` or back to `/login`.
- Email confirmation redirects should also point to `/auth/callback`.
- The Vercel deployment needs SPA rewrites so direct visits to `/sales` and `/auth/callback` resolve to `index.html`.
