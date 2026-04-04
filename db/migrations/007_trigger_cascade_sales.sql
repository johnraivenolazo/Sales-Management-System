-- Sprint 2 / M3 / db/trigger-cascade-sales
-- Cascade soft-delete and recovery from sales to salesDetail.

BEGIN;

CREATE OR REPLACE FUNCTION public.cascade_sales_record_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_stamp TEXT;
BEGIN
  IF NEW.record_status IS NOT DISTINCT FROM OLD.record_status THEN
    RETURN NEW;
  END IF;

  IF NEW.record_status = 'INACTIVE' THEN
    next_stamp := 'CASCADE-DEL ' || NEW.transNo || ' ' || TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS');
  ELSIF NEW.record_status = 'ACTIVE' THEN
    next_stamp := 'CASCADE-RECOVER ' || NEW.transNo || ' ' || TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS');
  ELSE
    RETURN NEW;
  END IF;

  UPDATE public.salesDetail
  SET
    record_status = NEW.record_status,
    stamp = next_stamp
  WHERE transNo = NEW.transNo
    AND record_status IS DISTINCT FROM NEW.record_status;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_sales_record_status_change ON public.sales;

CREATE TRIGGER on_sales_record_status_change
AFTER UPDATE OF record_status ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.cascade_sales_record_status();

COMMIT;
