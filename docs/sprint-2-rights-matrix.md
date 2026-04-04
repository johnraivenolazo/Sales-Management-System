# Sprint 2 Rights Matrix

This artifact records the Sprint 2 M5 rights expectations for all 13 rights across the three user types.

Automated coverage:
- [src/test/sprint2-rights-matrix.test.jsx](C:\Users\aven\Desktop\repo\Sales-Management-System-prince\src\test\sprint2-rights-matrix.test.jsx)

Important note:
- The project docs contain one inconsistency around `ADM_USER` for `ADMIN`.
- This matrix follows the more detailed user-type definition in the project guide, where `ADMIN` keeps `ADM_USER = 1` so account activation remains possible.

## Matrix

| Right | SUPERADMIN | ADMIN | USER |
| --- | --- | --- | --- |
| `SALES_VIEW` | Pass | Pass | Pass |
| `SALES_ADD` | Pass | Pass | Block |
| `SALES_EDIT` | Pass | Pass | Block |
| `SALES_DEL` | Pass | Block | Block |
| `SD_VIEW` | Pass | Pass | Pass |
| `SD_ADD` | Pass | Pass | Block |
| `SD_EDIT` | Pass | Pass | Block |
| `SD_DEL` | Pass | Block | Block |
| `CUST_LOOKUP` | Pass | Pass | Pass |
| `EMP_LOOKUP` | Pass | Pass | Pass |
| `PROD_LOOKUP` | Pass | Pass | Pass |
| `PRICE_LOOKUP` | Pass | Pass | Pass |
| `ADM_USER` | Pass | Pass | Block |

## Role Visibility Notes

| Behavior | SUPERADMIN | ADMIN | USER |
| --- | --- | --- | --- |
| Can see `stamp` | Yes | Yes | No |
| Can access `/deleted-items` | Yes | Yes | No |
| Can access Admin navigation | Yes | Yes | No |

## Pass Criteria

- All 39 right checks match the Sprint 2 role defaults.
- Stamp visibility stays hidden for `USER`.
- Deleted Items and Admin access stay limited to admin-capable roles.
