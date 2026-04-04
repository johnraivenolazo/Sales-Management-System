-- Sprint 2 / M3 verification
-- Use after running migrations 004-008 in Supabase SQL Editor.

-- Confirm RLS is enabled on all Sprint 2 target tables.
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
    'pricehist'
  )
ORDER BY cls.relname;

-- Confirm the expected policies exist.
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
    'pricehist'
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

-- Confirm the cascade trigger exists.
SELECT
  event_object_table AS table_name,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table = 'sales'
ORDER BY trigger_name;

-- Confirm the enrichment views exist and return rows.
SELECT 'sales_with_lookup' AS view_name, COUNT(*) AS row_count FROM public.sales_with_lookup
UNION ALL
SELECT 'salesdetail_with_product', COUNT(*) FROM public.salesdetail_with_product;

-- Spot-check view columns for downstream app use.
SELECT * FROM public.sales_with_lookup ORDER BY salesDate DESC, transNo DESC LIMIT 5;
SELECT * FROM public.salesdetail_with_product ORDER BY transNo DESC, prodCode ASC LIMIT 5;
