# Google OAuth Setup

Sprint 1 M4 reference for wiring Google OAuth with the current Supabase project.

## Supabase Dashboard

Use these values in `Authentication -> URL Configuration`:

- Site URL: `http://localhost:5173`
- Additional Redirect URL: `http://localhost:5173/auth/callback`
- Additional Redirect URL: `https://your-production-domain/auth/callback`

## Google Cloud Console

Use the Supabase callback URL as an authorized redirect URI for the Google OAuth client:

- `https://sxtntoyfjzosjfyuqhyt.supabase.co/auth/v1/callback`

## App Notes

- The frontend sends both Google sign-in buttons to `/auth/callback`.
- `/auth/callback` is handled in the app before redirecting the user to `/sales` or back to `/login`.
- Email confirmation redirects should also point to `/auth/callback`.
