# Sprint 1 Gate Checklist

## Gate Status

- Overall status: Ready for Sprint 2 once the `dev` branch contains the merged
  Sprint 1 M1-M5 work.

## Required Gate

### 1. All 6 core tables are seeded with the correct row counts

- Status: Pass
- Verification source: hosted Supabase SQL verification queries from Sprint 1

| Table | Expected | Verified |
| --- | ---: | ---: |
| `employee` | 32 | 32 |
| `customer` | 82 | 82 |
| `sales` | 124 | 124 |
| `product` | 57 | 57 |
| `salesDetail` | 313 | 313 |
| `priceHist` | 79 | 79 |

### 2. Rights-side Sprint 1 seed is complete

- Status: Pass
- Verification source: Sprint 1 rights seed verification query

| Table | Expected | Verified |
| --- | ---: | ---: |
| `"user"` | 1 | 1 |
| `module` | 4 | 4 |
| `rights` | 13 | 13 |
| `user_module` | 4 | 4 |
| `user_module_rights` | 13 | 13 |

### 3. Foreign-key integrity checks return no missing references

- Status: Pass
- Expected result for each check: `0`

Checks run:

- `sales_without_customer`
- `sales_without_employee`
- `salesdetail_without_sales`
- `salesdetail_without_product`
- `pricehist_without_product`

### 4. Seeded SUPERADMIN has the expected module access

- Status: Pass
- Expected result:
  - `userId = 'user1'`
  - `module_rows = 4`

### 5. Seeded SUPERADMIN has all 13 rights enabled

- Status: Pass
- Expected result:
  - `userId = 'user1'`
  - `right_rows = 13`
  - `enabled_rights = 13`

### 6. Email auth flow works through the shared auth system

- Status: Pass
- Evidence:
  - Sprint 1 auth tests cover email registration.
  - Auth context exposes `signUpWithEmail()` and `signInWithEmail()`.
  - The login guard resolves the app-side profile before allowing route access.

### 7. Google OAuth flow works through the shared auth system

- Status: Pass
- Evidence:
  - Sprint 1 auth tests cover the Google OAuth start flow.
  - `/auth/callback` is wired for OAuth redirects.
  - The provisioning trigger creates an app-side user record for new auth users.

### 8. Login guard blocks inactive users

- Status: Pass
- Expected behavior:
  - A signed-in user with `record_status = 'INACTIVE'` is signed out and sent
    back to the login flow.

### 9. Login guard allows active users

- Status: Pass
- Expected behavior:
  - A signed-in user with `record_status = 'ACTIVE'` can access protected routes
    such as `/sales`.

## Notes

- Sprint 1 intentionally provisions newly created users as `USER / INACTIVE`.
- Sprint 1 proves auth, provisioning, and guard behavior.
- Full admin-side activation tooling belongs to later sprint work.
