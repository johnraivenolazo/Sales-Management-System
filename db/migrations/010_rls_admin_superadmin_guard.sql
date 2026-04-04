-- Sprint 3 / M3 / db/rls-admin-superadmin-guard
-- Admin-facing protections for user activation and SUPERADMIN safeguards.

BEGIN;

CREATE OR REPLACE FUNCTION public.guard_admin_user_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.user_type = 'SUPERADMIN' THEN
    RAISE EXCEPTION 'SUPERADMIN accounts cannot be modified through the admin workflow.';
  END IF;

  IF NEW.userid IS DISTINCT FROM OLD.userid
    OR NEW.username IS DISTINCT FROM OLD.username
    OR NEW.email IS DISTINCT FROM OLD.email
    OR NEW.first_name IS DISTINCT FROM OLD.first_name
    OR NEW.last_name IS DISTINCT FROM OLD.last_name
    OR NEW.user_type IS DISTINCT FROM OLD.user_type THEN
    RAISE EXCEPTION 'The admin workflow may only update record_status and stamp.';
  END IF;

  RETURN NEW;
END;
$$;

ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module_rights ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS guard_admin_user_update ON public."user";
CREATE TRIGGER guard_admin_user_update
BEFORE UPDATE ON public."user"
FOR EACH ROW
EXECUTE FUNCTION public.guard_admin_user_update();

DROP POLICY IF EXISTS admin_user_select ON public."user";
DROP POLICY IF EXISTS admin_user_status_update ON public."user";
DROP POLICY IF EXISTS admin_user_rights_select ON public.user_module_rights;
DROP POLICY IF EXISTS user_self_select ON public."user";
DROP POLICY IF EXISTS user_self_rights_select ON public.user_module_rights;

CREATE POLICY admin_user_select
ON public."user"
FOR SELECT
TO authenticated
USING (public.current_app_user_has_right('ADM_USER'));

CREATE POLICY user_self_select
ON public."user"
FOR SELECT
TO authenticated
USING (userid = public.current_app_user_id());

CREATE POLICY admin_user_status_update
ON public."user"
FOR UPDATE
TO authenticated
USING (
  public.current_app_user_has_right('ADM_USER')
  AND userid <> public.current_app_user_id()
  AND user_type <> 'SUPERADMIN'
)
WITH CHECK (
  public.current_app_user_has_right('ADM_USER')
  AND userid <> public.current_app_user_id()
  AND user_type <> 'SUPERADMIN'
);

CREATE POLICY admin_user_rights_select
ON public.user_module_rights
FOR SELECT
TO authenticated
USING (public.current_app_user_has_right('ADM_USER'));

CREATE POLICY user_self_rights_select
ON public.user_module_rights
FOR SELECT
TO authenticated
USING (userid = public.current_app_user_id());

-- Intentionally no INSERT / UPDATE / DELETE policies exist on user_module_rights.
-- This keeps admin-facing access read-only and prevents authenticated app users
-- from modifying rights rows through PostgREST.

COMMIT;
