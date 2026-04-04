-- Sprint 2 / M3 / db/rls-lookup-tables
-- Lookup tables are read-only for every authenticated role. RLS permits
-- SELECT only and intentionally leaves writes without any policy.

BEGIN;

ALTER TABLE public.customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priceHist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS customer_lookup_select ON public.customer;
DROP POLICY IF EXISTS employee_lookup_select ON public.employee;
DROP POLICY IF EXISTS product_lookup_select ON public.product;
DROP POLICY IF EXISTS pricehist_lookup_select ON public.priceHist;

CREATE POLICY customer_lookup_select
ON public.customer
FOR SELECT
TO authenticated
USING (public.current_app_user_has_right('CUST_LOOKUP'));

CREATE POLICY employee_lookup_select
ON public.employee
FOR SELECT
TO authenticated
USING (public.current_app_user_has_right('EMP_LOOKUP'));

CREATE POLICY product_lookup_select
ON public.product
FOR SELECT
TO authenticated
USING (public.current_app_user_has_right('PROD_LOOKUP'));

CREATE POLICY pricehist_lookup_select
ON public.priceHist
FOR SELECT
TO authenticated
USING (public.current_app_user_has_right('PRICE_LOOKUP'));

COMMIT;
