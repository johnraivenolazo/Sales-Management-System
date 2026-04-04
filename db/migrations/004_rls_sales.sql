-- Sprint 2 / M3 / db/rls-sales
-- Row level security for sales with rights-aware visibility, create, edit,
-- soft-delete, and recovery behavior.

BEGIN;

CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid()::TEXT;
$$;

CREATE OR REPLACE FUNCTION public.current_app_user_type()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT u.user_type
      FROM public."user" AS u
      WHERE u.userid = public.current_app_user_id()
        AND u.record_status = 'ACTIVE'
      LIMIT 1
    ),
    ''
  );
$$;

CREATE OR REPLACE FUNCTION public.current_app_user_has_right(target_right_code TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_module_rights AS umr
    JOIN public."user" AS u
      ON u.userid = umr.userid
    WHERE u.userid = public.current_app_user_id()
      AND u.record_status = 'ACTIVE'
      AND umr.right_code = target_right_code
      AND umr.right_value = 1
      AND umr.record_status = 'ACTIVE'
  );
$$;

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sales_select_visibility ON public.sales;
DROP POLICY IF EXISTS sales_insert_with_right ON public.sales;
DROP POLICY IF EXISTS sales_update_edit ON public.sales;
DROP POLICY IF EXISTS sales_soft_delete ON public.sales;
DROP POLICY IF EXISTS sales_recover ON public.sales;

CREATE POLICY sales_select_visibility
ON public.sales
FOR SELECT
TO authenticated
USING (
  public.current_app_user_has_right('SALES_VIEW')
  AND (
    record_status = 'ACTIVE'
    OR public.current_app_user_type() IN ('ADMIN', 'SUPERADMIN')
  )
);

CREATE POLICY sales_insert_with_right
ON public.sales
FOR INSERT
TO authenticated
WITH CHECK (
  public.current_app_user_has_right('SALES_ADD')
  AND COALESCE(record_status, 'ACTIVE') = 'ACTIVE'
);

CREATE POLICY sales_update_edit
ON public.sales
FOR UPDATE
TO authenticated
USING (
  public.current_app_user_has_right('SALES_EDIT')
  AND record_status = 'ACTIVE'
)
WITH CHECK (
  public.current_app_user_has_right('SALES_EDIT')
  AND record_status = 'ACTIVE'
);

CREATE POLICY sales_soft_delete
ON public.sales
FOR UPDATE
TO authenticated
USING (
  public.current_app_user_has_right('SALES_DEL')
  AND record_status = 'ACTIVE'
)
WITH CHECK (
  public.current_app_user_has_right('SALES_DEL')
  AND record_status = 'INACTIVE'
);

CREATE POLICY sales_recover
ON public.sales
FOR UPDATE
TO authenticated
USING (
  public.current_app_user_type() IN ('ADMIN', 'SUPERADMIN')
  AND record_status = 'INACTIVE'
)
WITH CHECK (
  public.current_app_user_type() IN ('ADMIN', 'SUPERADMIN')
  AND record_status = 'ACTIVE'
);

COMMIT;
