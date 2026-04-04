# Sprint 2 Lookup-Only And Price Autofill Report

This document records the Sprint 2 M5 validation points for the four lookup pages and the Sales Detail price autofill behavior.

Related automated coverage:
- [src/test/sprint2-lookup-price-autofill.test.jsx](C:\Users\aven\Desktop\repo\Sales-Management-System-prince\src\test\sprint2-lookup-price-autofill.test.jsx)

## Repo-Side Automated Checks

| Check | Evidence |
| --- | --- |
| Lookup routes redirect away when the matching right is missing | Automated `LookupRouteGuard` test |
| Lookup routes render when the matching right exists | Automated `LookupRouteGuard` test |
| Customer lookup stays mutation-free | Automated page render test |
| Employee lookup stays mutation-free | Automated page render test |
| Product lookup stays mutation-free | Automated page render test |
| Price history lookup stays mutation-free | Automated page render test |
| Latest `priceHist` value is shown in the line-item dialog | Automated `LineItemFormDialog` test |
| Estimated row total updates from quantity x latest unit price | Automated `LineItemFormDialog` test |

## Manual Browser Verification

### Lookup-Only Rule

Expected result for all of these routes:
- `/lookups/customers`
- `/lookups/employees`
- `/lookups/products`
- `/lookups/prices`

Checks:
1. No create button
2. No edit button
3. No delete button
4. No recover button
5. No write mutation request in the network tab

### Price Autofill

Expected result in Add/Edit line item flow:
1. Select a product in the line-item dialog
2. The latest `priceHist.effDate` row for that product supplies the current unit price
3. The estimated row total updates immediately as `quantity * latest price`

Suggested live verification:
- use a product with a known latest price entry from `priceHist`
- confirm the displayed price matches the latest row, not an older historical row
