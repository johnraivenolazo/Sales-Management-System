# Sprint 2 Log

## Sprint Window

- Sprint: `Sprint 2`
- Theme: Sales CRUD, SalesDetail CRUD, lookup integration, rights gating, cascade soft-delete, and Deleted Items

## Completed Work Snapshot

- Sales services for `sales`, `salesDetail`, and lookups were wired
- Rights context, UI gating, stamp visibility, and lookup route guards were added
- Sales list, Sales detail, lookup pages, and Deleted Items are now real pages instead of placeholders
- Database RLS, cascade trigger, and enrichment views were added through Sprint 2 M3 migrations
- Sprint 2 QA artifacts now cover the rights matrix, cascade visibility rules, lookup-only behavior, and price autofill expectations

## M5 Focus

- Recorded a 39-case rights matrix for the three user types
- Added repo-side verification for Deleted Items visibility and active-only service filtering
- Added repo-side verification that no hard-delete statements exist in services or migrations
- Prepared manual hosted verification steps for cascade soft-delete, recovery, and RLS bypass behavior

## Blockers Encountered

- Some Sprint 2 behaviors depend on real authenticated roles and hosted Supabase state, so not every gate can be proven through isolated unit tests alone
- The project docs contain one inconsistency around `ADM_USER` for `ADMIN`, so the rights matrix follows the more detailed user-type definition section

## Resolution

- Added automated coverage where the repo can prove behavior safely
- Added explicit manual verification notes where hosted Supabase role behavior must be observed directly
- Kept the test artifacts aligned with the current Sprint 2 implementation rather than a stale placeholder state

## Next Checks Before Sprint 2 Closeout

1. Re-run the manual cascade and recovery checks on the hosted Supabase data set.
2. Confirm inactive rows stay hidden for `USER` in the live app.
3. Confirm all four lookup pages remain mutation-free in the browser.
