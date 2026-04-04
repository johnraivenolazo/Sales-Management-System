# Sprint 2 Cascade And Visibility Report

This document captures the Sprint 2 M5 verification points for cascade soft-delete, recovery, RLS-style visibility, and the no-hard-delete rule.

Related automated coverage:
- [src/test/sprint2-cascade-visibility.test.jsx](C:\Users\aven\Desktop\repo\Sales-Management-System-prince\src\test\sprint2-cascade-visibility.test.jsx)

## Coverage Summary

| Check | Evidence |
| --- | --- |
| `/deleted-items` redirects `USER` away | Automated route-guard test |
| `/deleted-items` opens for admin-capable roles | Automated route-guard test |
| `getSales("USER")` requests active-only rows | Automated service test |
| `getDetailByTrans(transNo, "USER")` requests active-only rows | Automated service test |
| Soft delete uses `UPDATE`, not hard delete | Automated service test |
| No hard-delete statements exist in services or migrations | Automated source scan |
| Cascade parent-child behavior | Manual DB verification required on hosted Supabase |
| Recovery parent-child behavior | Manual DB verification required on hosted Supabase |
| RLS bypass behavior | Manual verification with real authenticated roles required |

## Manual Hosted Verification

### Cascade Soft Delete

Transaction:
- `TR000001`

Expected result:
- setting the parent `sales.record_status` to `INACTIVE` should also mark every related `salesDetail` row as `INACTIVE`
- `USER` should stop seeing both the transaction and its line items
- admin-capable roles should still be able to see the records through Deleted Items

### Cascade Recovery

Transaction:
- `TR000001`

Expected result:
- recovering the parent row back to `ACTIVE` should also recover all related `salesDetail` rows
- the transaction and its line items should reappear in normal user views after recovery

### RLS Bypass Check

Expected result:
- even if the client forgets to add an active-only filter, `USER` should still be blocked from inactive `sales` and `salesDetail` rows by the DB policies

Suggested live checks:
1. Sign in as `USER` and confirm inactive parent and child rows are hidden.
2. Sign in as `ADMIN` or `SUPERADMIN` and confirm inactive rows remain visible for recovery.
3. Recover the parent transaction and confirm the child rows return with it.

## No Hard Delete Rule

Repo-side verification included in the automated test:
- no `DELETE FROM` statements in `src/services`
- no `DELETE FROM` statements in `db/migrations`
- no `.delete(` Supabase calls in the same areas
