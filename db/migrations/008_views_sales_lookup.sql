-- Sprint 2 / M3 / db/views-sales-lookup
-- Enriched views for sales list and sales detail lookups.

BEGIN;

CREATE OR REPLACE VIEW public.sales_with_lookup AS
SELECT
  s.transNo,
  s.salesDate,
  s.custNo,
  c.custname,
  c.address,
  c.payterm,
  s.empNo,
  e.lastname,
  e.firstname,
  TRIM(CONCAT(COALESCE(e.lastname, ''), ', ', COALESCE(e.firstname, ''))) AS employee_name,
  s.record_status,
  s.stamp
FROM public.sales AS s
LEFT JOIN public.customer AS c
  ON c.custno = s.custNo
LEFT JOIN public.employee AS e
  ON e.empno = s.empNo;

CREATE OR REPLACE VIEW public.salesdetail_with_product AS
WITH latest_price AS (
  SELECT DISTINCT ON (ph.prodCode)
    ph.prodCode,
    ph.effDate,
    ph.unitPrice
  FROM public.priceHist AS ph
  ORDER BY ph.prodCode, ph.effDate DESC
)
SELECT
  sd.transNo,
  sd.prodCode,
  p.description,
  p.unit,
  sd.quantity,
  lp.effDate AS latest_price_date,
  lp.unitPrice,
  COALESCE(sd.quantity, 0) * COALESCE(lp.unitPrice, 0) AS row_total,
  sd.record_status,
  sd.stamp
FROM public.salesDetail AS sd
LEFT JOIN public.product AS p
  ON p.prodCode = sd.prodCode
LEFT JOIN latest_price AS lp
  ON lp.prodCode = sd.prodCode;

COMMIT;
