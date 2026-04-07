-- Sprint 3 / M6 / db/superadmin-user-role-write-policy
-- Allow SUPERADMIN to flip USER and ADMIN roles while keeping SUPERADMIN locked.

BEGIN;

CREATE OR REPLACE FUNCTION public.current_app_user_can_manage_user_role(target_user_id TEXT, next_user_type TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
      SELECT 1
          FROM public."user" AS target_user
              WHERE target_user.userid = target_user_id
                    AND target_user.record_status = 'ACTIVE'
                          AND target_user.userid <> public.current_app_user_id()
                                AND public.current_app_user_type() = 'SUPERADMIN'
                                      AND target_user.user_type IN ('ADMIN', 'USER')
                                            AND UPPER(next_user_type) IN ('ADMIN', 'USER')
                                              );
                                              $$;

                                              DROP POLICY IF EXISTS admin_user_role_update ON public."user";

                                              CREATE POLICY admin_user_role_update
                                              ON public."user"
                                              FOR UPDATE
                                              TO authenticated
                                              USING (
                                                public.current_app_user_can_manage_user_role(userid, user_type)
                                                )
                                                WITH CHECK (
                                                  public.current_app_user_can_manage_user_role(userid, user_type)
                                                  );

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
                                                                            OR NEW.last_name IS DISTINCT FROM OLD.last_name THEN
                                                                                RAISE EXCEPTION 'The admin workflow may only update record_status, user_type, and stamp.';
                                                                                  END IF;

                                                                                    IF NEW.user_type IS DISTINCT FROM OLD.user_type THEN
                                                                                        IF public.current_app_user_type() <> 'SUPERADMIN' THEN
                                                                                              RAISE EXCEPTION 'Only SUPERADMIN accounts can change user roles.';
                                                                                                  END IF;

                                                                                                      IF NEW.user_type NOT IN ('ADMIN', 'USER') THEN
                                                                                                            RAISE EXCEPTION 'User roles may only be changed to ADMIN or USER.';
                                                                                                                END IF;

                                                                                                                    IF NEW.record_status IS DISTINCT FROM OLD.record_status THEN
                                                                                                                          RAISE EXCEPTION 'Role changes must not modify record_status in the same update.';
                                                                                                                              END IF;

                                                                                                                                  RETURN NEW;
                                                                                                                                    END IF;

                                                                                                                                      IF NEW.record_status IS DISTINCT FROM OLD.record_status
                                                                                                                                          OR NEW.stamp IS DISTINCT FROM OLD.stamp THEN
                                                                                                                                              RETURN NEW;
                                                                                                                                                END IF;

                                                                                                                                                  RAISE EXCEPTION 'The admin workflow may only update record_status, user_type, and stamp.';
                                                                                                                                                  END;
                                                                                                                                                  $$;

                                                                                                                                                  COMMIT;