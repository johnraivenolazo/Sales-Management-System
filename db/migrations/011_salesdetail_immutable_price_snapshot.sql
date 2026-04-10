-- Sprint 3 / M5 / db/immutable-salesdetail-price
-- Freeze unit price per sales detail row so historical transaction totals remain immutable.

BEGIN;

ALTER TABLE public.salesDetail
ADD COLUMN IF NOT EXISTS unitPrice_snapshot DECIMAL(12,2);

ALTER TABLE public.salesDetail
DROP CONSTRAINT IF EXISTS salesdetail_unitprice_snapshot_ck;

ALTER TABLE public.salesDetail
ADD CONSTRAINT salesdetail_unitprice_snapshot_ck
CHECK (unitPrice_snapshot >= 0.0);

UPDATE public.salesDetail AS sd
SET unitPrice_snapshot = COALESCE(
  (
    SELECT ph.unitPrice
    FROM public.priceHist AS ph
    JOIN public.sales AS s
      ON s.transNo = sd.transNo
    WHERE ph.prodCode = sd.prodCode
      AND ph.effDate <= s.salesDate
    ORDER BY ph.effDate DESC
    LIMIT 1
  ),
  (
    SELECT ph_latest.unitPrice
    FROM public.priceHist AS ph_latest
    WHERE ph_latest.prodCode = sd.prodCode
    ORDER BY ph_latest.effDate DESC
    LIMIT 1
  ),
  0
)
WHERE sd.unitPrice_snapshot IS NULL;

ALTER TABLE public.salesDetail
ALTER COLUMN unitPrice_snapshot SET NOT NULL;

CREATE OR REPLACE FUNCTION public.freeze_salesdetail_unit_price()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sale_date DATE;
  resolved_unit_price NUMERIC(12,2);
BEGIN
  SELECT s.salesDate
  INTO sale_date
  FROM public.sales AS s
  WHERE s.transNo = NEW.transNo;

  IF sale_date IS NULL THEN
    RAISE EXCEPTION 'Cannot resolve sale date for transaction %.', NEW.transNo;
  END IF;

  SELECT ph.unitPrice
  INTO resolved_unit_price
  FROM public.priceHist AS ph
  WHERE ph.prodCode = NEW.prodCode
    AND ph.effDate <= sale_date
  ORDER BY ph.effDate DESC
  LIMIT 1;

  IF resolved_unit_price IS NULL THEN
    SELECT ph.unitPrice
    INTO resolved_unit_price
    FROM public.priceHist AS ph
    WHERE ph.prodCode = NEW.prodCode
    ORDER BY ph.effDate DESC
    LIMIT 1;
  END IF;

  IF resolved_unit_price IS NULL THEN
    RAISE EXCEPTION 'No price history found for product %.', NEW.prodCode;
  END IF;

  NEW.unitPrice_snapshot := resolved_unit_price;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_salesdetail_freeze_unit_price ON public.salesDetail;

CREATE TRIGGER on_salesdetail_freeze_unit_price
BEFORE INSERT OR UPDATE OF transNo, prodCode ON public.salesDetail
FOR EACH ROW
EXECUTE FUNCTION public.freeze_salesdetail_unit_price();

CREATE OR REPLACE VIEW public.sales_by_employee AS
SELECT
  e.empno,
  TRIM(CONCAT(COALESCE(e.lastname, ''), ', ', COALESCE(e.firstname, ''))) AS employee_name,
  COUNT(DISTINCT s.transNo) AS total_transactions,
  COALESCE(SUM(sd.quantity), 0) AS total_quantity,
  COALESCE(SUM(sd.quantity * COALESCE(sd.unitPrice_snapshot, 0)), 0) AS total_revenue
FROM public.employee AS e
JOIN public.sales AS s
  ON s.empNo = e.empno
  AND s.record_status = 'ACTIVE'
JOIN public.salesDetail AS sd
  ON sd.transNo = s.transNo
  AND sd.record_status = 'ACTIVE'
GROUP BY e.empno, e.lastname, e.firstname
ORDER BY total_revenue DESC, total_transactions DESC, employee_name ASC;

CREATE OR REPLACE VIEW public.sales_by_customer AS
SELECT
  c.custno,
  c.custname,
  c.payterm,
  COUNT(DISTINCT s.transNo) AS total_transactions,
  COALESCE(SUM(sd.quantity), 0) AS total_quantity,
  COALESCE(SUM(sd.quantity * COALESCE(sd.unitPrice_snapshot, 0)), 0) AS total_revenue
FROM public.customer AS c
JOIN public.sales AS s
  ON s.custNo = c.custno
  AND s.record_status = 'ACTIVE'
JOIN public.salesDetail AS sd
  ON sd.transNo = s.transNo
  AND sd.record_status = 'ACTIVE'
GROUP BY c.custno, c.custname, c.payterm
ORDER BY total_revenue DESC, total_transactions DESC, c.custname ASC;

CREATE OR REPLACE VIEW public.top_products_sold AS
SELECT
  p.prodCode,
  p.description,
  p.unit,
  COUNT(DISTINCT sd.transNo) AS total_transactions,
  COALESCE(SUM(sd.quantity), 0) AS total_quantity,
  COALESCE(SUM(sd.quantity * COALESCE(sd.unitPrice_snapshot, 0)), 0) AS total_revenue
FROM public.product AS p
JOIN public.salesDetail AS sd
  ON sd.prodCode = p.prodCode
  AND sd.record_status = 'ACTIVE'
JOIN public.sales AS s
  ON s.transNo = sd.transNo
  AND s.record_status = 'ACTIVE'
GROUP BY p.prodCode, p.description, p.unit
ORDER BY total_quantity DESC, total_revenue DESC, p.description ASC;

CREATE OR REPLACE VIEW public.monthly_sales_trend AS
SELECT
  TO_CHAR(DATE_TRUNC('month', s.salesDate), 'YYYY-MM') AS sale_month,
  DATE_TRUNC('month', s.salesDate)::DATE AS month_start,
  COUNT(DISTINCT s.transNo) AS total_transactions,
  COALESCE(SUM(sd.quantity), 0) AS total_quantity,
  COALESCE(SUM(sd.quantity * COALESCE(sd.unitPrice_snapshot, 0)), 0) AS total_revenue
FROM public.sales AS s
JOIN public.salesDetail AS sd
  ON sd.transNo = s.transNo
  AND sd.record_status = 'ACTIVE'
WHERE s.record_status = 'ACTIVE'
GROUP BY DATE_TRUNC('month', s.salesDate)
ORDER BY month_start ASC;

COMMIT;