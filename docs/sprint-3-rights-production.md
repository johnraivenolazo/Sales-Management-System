# Sprint 3 M4 Production Rights Regression

This checklist records the Sprint 3 M4 production verification for rights, admin gating, SUPERADMIN protection, and auth behavior.

## Scope

- Live URL
- `USER`, `ADMIN`, and `SUPERADMIN`
- Email sign-in
- Google OAuth
- Admin sidebar gating by `ADM_USER`
- SUPERADMIN protection in UI and DB
- Cascade behavior in production
- Lookup pages remain mutation-free

## Automated Coverage

- Playwright coverage lives in `tests/e2e`
- Covered automatically:
  - email sign-in for `USER`, `ADMIN`, and `SUPERADMIN`
  - USER access to `Sales`, `Sales Detail`, `Reports`, and all lookup pages
  - USER blocking on `/admin` and `/deleted-items`
  - ADMIN access to `/admin` and `/deleted-items`
  - ADMIN activation and deactivation of a `USER` account in User Management
  - SUPERADMIN access to `/admin` and `/deleted-items`
  - locked `SUPERADMIN` row actions in User Management
  - SUPERADMIN transaction create, soft-delete, recovery, line-item add/edit/delete/recover
  - lookup dropdown population in Sales and Sales Detail dialogs
  - price auto-fill visibility in the line-item dialog
  - report tab loading for all 4 report views
  - lookup pages staying mutation-free
- Run locally with:
  - `pnpm test:e2e`

## Manual Follow-up

- Google OAuth still needs manual verification in the live deployed app
- `/auth/callback` should still be manually checked against the deployed URL
- destructive cascade / recovery actions should be manually verified with care in production
- DB-level `SUPERADMIN` update blocking still needs direct SQL or API evidence

## Production Environment

- Live URL:
- Supabase project:
- Verification date:
- Verified by:

## Auth Verification

- [ ] `USER` can sign in with email
- [ ] `USER` can sign in with Google
- [ ] `ADMIN` can sign in with email
- [ ] `ADMIN` can sign in with Google
- [ ] `SUPERADMIN` can sign in with email
- [ ] `SUPERADMIN` can sign in with Google
- [ ] `/auth/callback` returns users to the correct workspace

## Rights Regression

### USER

- [ ] Sales route visibility is correct
- [ ] Sales Detail route visibility is correct
- [ ] Lookup pages remain read-only
- [ ] Admin route is hidden and blocked
- [ ] Deleted Items is hidden and blocked

### ADMIN

- [ ] Admin sidebar link appears only when `ADM_USER = 1`
- [ ] Admin route opens successfully
- [ ] Deleted Items route opens successfully
- [ ] Sales and lookup permissions match the assigned rights rows

### SUPERADMIN

- [ ] Admin route opens successfully
- [ ] Deleted Items route opens successfully
- [ ] All expected rights remain available

## SUPERADMIN Protection

- [ ] SUPERADMIN rows show locked actions in User Management
- [ ] Activate button is disabled for SUPERADMIN rows
- [ ] Deactivate button is disabled for SUPERADMIN rows
- [ ] Direct database update attempt from an admin context is blocked
- [ ] DB-level protection message is captured as evidence

## Lookup and Cascade Verification

- [ ] Customer lookup is mutation-free in production
- [ ] Employee lookup is mutation-free in production
- [ ] Product lookup is mutation-free in production
- [ ] Price lookup is mutation-free in production
- [ ] Soft-delete cascade still works in production
- [ ] Recovery cascade still works in production

## Evidence Log

| Check | Result | Notes / Evidence |
| --- | --- | --- |
| USER auth |  |  |
| ADMIN auth |  |  |
| SUPERADMIN auth |  |  |
| Admin gating |  |  |
| SUPERADMIN UI lock |  |  |
| SUPERADMIN DB guard |  |  |
| Lookup-only verification |  |  |
| Cascade verification |  |  |

## Final Signoff

- [ ] All production rights checks passed
- [ ] All SUPERADMIN safeguards passed
- [ ] Auth and callback behavior passed
- [ ] Evidence captured for Sprint 3 release review
