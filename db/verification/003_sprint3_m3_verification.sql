-- Sprint 3 / M3 verification
-- Use after running migrations 004-010 in Supabase SQL Editor.

-- Confirm RLS is enabled on the Sprint 2 base tables plus the Sprint 3 admin tables.
SELECT
  cls.relname AS table_name,
  cls.relrowsecurity AS rls_enabled
FROM pg_class AS cls
JOIN pg_namespace AS ns
  ON ns.oid = cls.relnamespace
WHERE ns.nspname = 'public'
  AND cls.relname IN (
    'sales',
    'salesdetail',
    'customer',
    'employee',
    'product',
    'pricehist',
    'user',
    'user_module_rights'
  )
ORDER BY cls.relname;

-- Confirm the expected policies exist on business, lookup, and admin tables.
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'sales',
    'salesdetail',
    'customer',
    'employee',
    'product',
    'pricehist',
    'user',
    'user_module_rights'
  )
ORDER BY tablename, policyname;

-- Confirm lookup tables remain SELECT-only.
SELECT
  tablename,
  STRING_AGG(cmd, ', ' ORDER BY cmd) AS policy_commands
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('customer', 'employee', 'product', 'pricehist')
GROUP BY tablename
ORDER BY tablename;

-- Confirm user_module_rights remains read-only through RLS.
SELECT
  tablename,
  STRING_AGG(cmd, ', ' ORDER BY cmd) AS policy_commands
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'user_module_rights'
GROUP BY tablename;

-- Confirm the expected triggers exist.
SELECT
  event_object_table AS table_name,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('sales', 'user')
ORDER BY event_object_table, trigger_name;

-- Confirm the report views exist and return rows.
SELECT 'sales_by_employee' AS view_name, COUNT(*) AS row_count FROM public.sales_by_employee
UNION ALL
SELECT 'sales_by_customer', COUNT(*) FROM public.sales_by_customer
UNION ALL
SELECT 'top_products_sold', COUNT(*) FROM public.top_products_sold
UNION ALL
SELECT 'monthly_sales_trend', COUNT(*) FROM public.monthly_sales_trend;

-- Spot-check report outputs for downstream APIs and UI pages.
SELECT * FROM public.sales_by_employee ORDER BY total_revenue DESC, employee_name ASC LIMIT 5;
SELECT * FROM public.sales_by_customer ORDER BY total_revenue DESC, custname ASC LIMIT 5;
SELECT * FROM public.top_products_sold ORDER BY total_quantity DESC, description ASC LIMIT 5;
SELECT * FROM public.monthly_sales_trend ORDER BY month_start ASC LIMIT 12;
