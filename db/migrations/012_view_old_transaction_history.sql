-- Sprint 3 / M5 / db/view-old-transaction-history
-- Separate read-only ledger for historical transaction line pricing.

BEGIN;

CREATE OR REPLACE VIEW public.old_transaction_history AS
SELECT
  s.transNo,
  s.salesDate,
  s.custNo,
  c.custname,
  s.empNo,
  TRIM(CONCAT(COALESCE(e.lastname, ''), ', ', COALESCE(e.firstname, ''))) AS employee_name,
  sd.prodCode,
  p.description,
  p.unit,
  sd.quantity,
  sd.unitPrice_snapshot,
  COALESCE(sd.quantity, 0) * COALESCE(sd.unitPrice_snapshot, 0) AS line_total,
  s.record_status AS sale_status,
  sd.record_status AS detail_status
FROM public.sales AS s
JOIN public.salesDetail AS sd
  ON sd.transNo = s.transNo
JOIN public.customer AS c
  ON c.custno = s.custNo
JOIN public.employee AS e
  ON e.empno = s.empNo
JOIN public.product AS p
  ON p.prodCode = sd.prodCode
WHERE s.record_status = 'ACTIVE'
  AND sd.record_status = 'ACTIVE'
ORDER BY s.salesDate ASC, s.transNo ASC, sd.prodCode ASC;

COMMIT;