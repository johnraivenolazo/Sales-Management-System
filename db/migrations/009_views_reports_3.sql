-- Sprint 3 / M3 / db/views-reports-3
-- Report views for the four final Sprint 3 analytics pages.

BEGIN;

CREATE OR REPLACE VIEW public.sales_by_employee AS
WITH latest_price AS (
  SELECT DISTINCT ON (ph.prodCode)
    ph.prodCode,
    ph.effDate,
    ph.unitPrice
  FROM public.priceHist AS ph
  ORDER BY ph.prodCode, ph.effDate DESC
)
SELECT
  e.empno,
  TRIM(CONCAT(COALESCE(e.lastname, ''), ', ', COALESCE(e.firstname, ''))) AS employee_name,
  COUNT(DISTINCT s.transNo) AS total_transactions,
  COALESCE(SUM(sd.quantity), 0) AS total_quantity,
  COALESCE(SUM(sd.quantity * COALESCE(lp.unitPrice, 0)), 0) AS total_revenue
FROM public.employee AS e
JOIN public.sales AS s
  ON s.empNo = e.empno
  AND s.record_status = 'ACTIVE'
JOIN public.salesDetail AS sd
  ON sd.transNo = s.transNo
  AND sd.record_status = 'ACTIVE'
LEFT JOIN latest_price AS lp
  ON lp.prodCode = sd.prodCode
GROUP BY e.empno, e.lastname, e.firstname
ORDER BY total_revenue DESC, total_transactions DESC, employee_name ASC;

CREATE OR REPLACE VIEW public.sales_by_customer AS
WITH latest_price AS (
  SELECT DISTINCT ON (ph.prodCode)
    ph.prodCode,
    ph.effDate,
    ph.unitPrice
  FROM public.priceHist AS ph
  ORDER BY ph.prodCode, ph.effDate DESC
)
SELECT
  c.custno,
  c.custname,
  c.payterm,
  COUNT(DISTINCT s.transNo) AS total_transactions,
  COALESCE(SUM(sd.quantity), 0) AS total_quantity,
  COALESCE(SUM(sd.quantity * COALESCE(lp.unitPrice, 0)), 0) AS total_revenue
FROM public.customer AS c
JOIN public.sales AS s
  ON s.custNo = c.custno
  AND s.record_status = 'ACTIVE'
JOIN public.salesDetail AS sd
  ON sd.transNo = s.transNo
  AND sd.record_status = 'ACTIVE'
LEFT JOIN latest_price AS lp
  ON lp.prodCode = sd.prodCode
GROUP BY c.custno, c.custname, c.payterm
ORDER BY total_revenue DESC, total_transactions DESC, c.custname ASC;

CREATE OR REPLACE VIEW public.top_products_sold AS
WITH latest_price AS (
  SELECT DISTINCT ON (ph.prodCode)
    ph.prodCode,
    ph.effDate,
    ph.unitPrice
  FROM public.priceHist AS ph
  ORDER BY ph.prodCode, ph.effDate DESC
)
SELECT
  p.prodCode,
  p.description,
  p.unit,
  COUNT(DISTINCT sd.transNo) AS total_transactions,
  COALESCE(SUM(sd.quantity), 0) AS total_quantity,
  COALESCE(SUM(sd.quantity * COALESCE(lp.unitPrice, 0)), 0) AS total_revenue
FROM public.product AS p
JOIN public.salesDetail AS sd
  ON sd.prodCode = p.prodCode
  AND sd.record_status = 'ACTIVE'
JOIN public.sales AS s
  ON s.transNo = sd.transNo
  AND s.record_status = 'ACTIVE'
LEFT JOIN latest_price AS lp
  ON lp.prodCode = p.prodCode
GROUP BY p.prodCode, p.description, p.unit
ORDER BY total_quantity DESC, total_revenue DESC, p.description ASC;

CREATE OR REPLACE VIEW public.monthly_sales_trend AS
WITH latest_price AS (
  SELECT DISTINCT ON (ph.prodCode)
    ph.prodCode,
    ph.effDate,
    ph.unitPrice
  FROM public.priceHist AS ph
  ORDER BY ph.prodCode, ph.effDate DESC
)
SELECT
  TO_CHAR(DATE_TRUNC('month', s.salesDate), 'YYYY-MM') AS sale_month,
  DATE_TRUNC('month', s.salesDate)::DATE AS month_start,
  COUNT(DISTINCT s.transNo) AS total_transactions,
  COALESCE(SUM(sd.quantity), 0) AS total_quantity,
  COALESCE(SUM(sd.quantity * COALESCE(lp.unitPrice, 0)), 0) AS total_revenue
FROM public.sales AS s
JOIN public.salesDetail AS sd
  ON sd.transNo = s.transNo
  AND sd.record_status = 'ACTIVE'
LEFT JOIN latest_price AS lp
  ON lp.prodCode = sd.prodCode
WHERE s.record_status = 'ACTIVE'
GROUP BY DATE_TRUNC('month', s.salesDate)
ORDER BY month_start ASC;

COMMIT;
