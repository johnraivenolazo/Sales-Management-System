# Sprint 3 Final RLS Audit

This artifact closes the Sprint 3 M3 audit requirement from the project docs.

## Scope

- `sales`
- `salesDetail`
- `customer`
- `employee`
- `product`
- `priceHist`
- `user`
- `user_module_rights`

## Required checks

- Confirm row-level security is enabled on all business, lookup, and admin tables.
- Confirm `sales` still has the 5 Sprint 2 policies:
  - `sales_select_visibility`
  - `sales_insert_with_right`
  - `sales_update_edit`
  - `sales_soft_delete`
  - `sales_recover`
- Confirm `salesDetail` still has the 5 Sprint 2 policies:
  - `salesdetail_select_visibility`
  - `salesdetail_insert_with_right`
  - `salesdetail_update_edit`
  - `salesdetail_soft_delete`
  - `salesdetail_recover`
- Confirm lookup tables remain `SELECT`-only.
- Confirm Sprint 3 admin policies exist on:
  - `user`
  - `user_module_rights`
- Confirm the sales cascade trigger still exists.
- Confirm the admin guard trigger exists on `user`.
- Confirm all report views exist and return rows.

## SQL verification file

Run:

```sql
\i db/verification/003_sprint3_m3_verification.sql
```

If you are using the Supabase SQL Editor, paste the contents of:

- `db/verification/003_sprint3_m3_verification.sql`

## Hard-delete audit

Project rule:

- No hard deletes. The `DELETE` keyword must never appear in application code, Supabase functions, or RLS policies.

Recommended local audit commands:

```powershell
rg -n "\bDELETE\b" src db --glob "!**/*.md"
rg -n "delete from" db src --glob "!**/*.md" -i
```

Expected result:

- No destructive SQL `DELETE FROM ...` statements should exist in app code, migrations, or verification SQL.
- UI text such as "Delete" buttons is allowed, but actual hard-delete SQL is not.

Current local audit result:

- `rg -n "\\bDELETE\\b" src db --glob "!**/*.md"` returned no matches.
- `rg -n "delete from" db src --glob "!**/*.md" -i` returned no matches.

## Admin guard expectation

- `ADM_USER` is required to read admin-facing user data.
- `user` updates must not allow authenticated app users to modify `SUPERADMIN` rows.
- `user_module_rights` must remain read-only through app-facing RLS, preventing rights edits through PostgREST.

## Final signoff checklist

- [ ] `003_sprint3_m3_verification.sql` executed successfully in Supabase
- [ ] All expected policies are present
- [ ] Lookup tables confirmed `SELECT`-only
- [ ] `user_module_rights` confirmed read-only
- [ ] Sales cascade trigger still present
- [ ] Admin guard trigger present on `user`
- [ ] All 4 report views return rows
- [ ] Hard-delete audit completed with no disallowed SQL statements found
