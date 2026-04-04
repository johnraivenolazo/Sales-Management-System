-- Sprint 2 / M3 / db/rls-salesdetail
-- Row level security for salesDetail with rights-aware visibility, create,
-- edit, soft-delete, and recovery behavior.

BEGIN;

ALTER TABLE public.salesDetail ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS salesdetail_select_visibility ON public.salesDetail;
DROP POLICY IF EXISTS salesdetail_insert_with_right ON public.salesDetail;
DROP POLICY IF EXISTS salesdetail_update_edit ON public.salesDetail;
DROP POLICY IF EXISTS salesdetail_soft_delete ON public.salesDetail;
DROP POLICY IF EXISTS salesdetail_recover ON public.salesDetail;

CREATE POLICY salesdetail_select_visibility
ON public.salesDetail
FOR SELECT
TO authenticated
USING (
  public.current_app_user_has_right('SD_VIEW')
  AND (
    record_status = 'ACTIVE'
    OR public.current_app_user_type() IN ('ADMIN', 'SUPERADMIN')
  )
);

CREATE POLICY salesdetail_insert_with_right
ON public.salesDetail
FOR INSERT
TO authenticated
WITH CHECK (
  public.current_app_user_has_right('SD_ADD')
  AND COALESCE(record_status, 'ACTIVE') = 'ACTIVE'
);

CREATE POLICY salesdetail_update_edit
ON public.salesDetail
FOR UPDATE
TO authenticated
USING (
  public.current_app_user_has_right('SD_EDIT')
  AND record_status = 'ACTIVE'
)
WITH CHECK (
  public.current_app_user_has_right('SD_EDIT')
  AND record_status = 'ACTIVE'
);

CREATE POLICY salesdetail_soft_delete
ON public.salesDetail
FOR UPDATE
TO authenticated
USING (
  public.current_app_user_has_right('SD_DEL')
  AND record_status = 'ACTIVE'
)
WITH CHECK (
  public.current_app_user_has_right('SD_DEL')
  AND record_status = 'INACTIVE'
);

CREATE POLICY salesdetail_recover
ON public.salesDetail
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
