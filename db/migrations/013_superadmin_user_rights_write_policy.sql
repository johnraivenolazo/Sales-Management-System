-- Sprint 3 / M5 / db/superadmin-user-rights-write-policy
-- Allow SUPERADMIN to manage per-user rights and add a controllable Deleted Items access right.

BEGIN;

CREATE OR REPLACE FUNCTION public.current_app_user_can_manage_rights(target_user_id TEXT)
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
                                AND (
                                        (
                                                  public.current_app_user_type() = 'SUPERADMIN'
                                                            AND target_user.user_type IN ('ADMIN', 'USER')
                                                                    )
                                                                            OR (
                                                                                      public.current_app_user_type() = 'ADMIN'
                                                                                                AND target_user.user_type = 'USER'
                                                                                                        )
                                                                                                              )
                                                                                                                );
                                                                                                                $$;

                                                                                                                INSERT INTO public.rights (
                                                                                                                  right_code,
                                                                                                                    right_name,
                                                                                                                      sort_order,
                                                                                                                        module_code,
                                                                                                                          record_status,
                                                                                                                            stamp
                                                                                                                            )
                                                                                                                            VALUES (
                                                                                                                              'DELETED_VIEW',
                                                                                                                                'View Deleted Items',
                                                                                                                                  14,
                                                                                                                                    'Adm_Mod',
                                                                                                                                      'ACTIVE',
                                                                                                                                        'SEEDED'
                                                                                                                                        )
                                                                                                                                        ON CONFLICT (right_code) DO UPDATE
                                                                                                                                        SET
                                                                                                                                          right_name = EXCLUDED.right_name,
                                                                                                                                            sort_order = EXCLUDED.sort_order,
                                                                                                                                              module_code = EXCLUDED.module_code,
                                                                                                                                                record_status = EXCLUDED.record_status,
                                                                                                                                                  stamp = EXCLUDED.stamp;

                                                                                                                                                  INSERT INTO public.user_module_rights (
                                                                                                                                                    userId,
                                                                                                                                                      right_code,
                                                                                                                                                        right_value,
                                                                                                                                                          record_status,
                                                                                                                                                            stamp
                                                                                                                                                            )
                                                                                                                                                            SELECT
                                                                                                                                                              u.userid,
                                                                                                                                                                'DELETED_VIEW',
                                                                                                                                                                  CASE WHEN u.user_type IN ('ADMIN', 'SUPERADMIN') THEN 1 ELSE 0 END,
                                                                                                                                                                    'ACTIVE',
                                                                                                                                                                      'SEEDED'
                                                                                                                                                                      FROM public."user" AS u
                                                                                                                                                                      ON CONFLICT (userId, right_code) DO UPDATE
                                                                                                                                                                      SET
                                                                                                                                                                        right_value = EXCLUDED.right_value,
                                                                                                                                                                          record_status = EXCLUDED.record_status,
                                                                                                                                                                            stamp = EXCLUDED.stamp;

                                                                                                                                                                            DROP POLICY IF EXISTS superadmin_user_rights_insert ON public.user_module_rights;
                                                                                                                                                                            DROP POLICY IF EXISTS superadmin_user_rights_update ON public.user_module_rights;
                                                                                                                                                                            DROP POLICY IF EXISTS superadmin_user_rights_delete ON public.user_module_rights;

                                                                                                                                                                            CREATE POLICY admin_user_rights_insert
                                                                                                                                                                            ON public.user_module_rights
                                                                                                                                                                            FOR INSERT
                                                                                                                                                                            TO authenticated
                                                                                                                                                                            WITH CHECK (
                                                                                                                                                                              public.current_app_user_can_manage_rights(userid)
                                                                                                                                                                              );

                                                                                                                                                                              CREATE POLICY admin_user_rights_update
                                                                                                                                                                              ON public.user_module_rights
                                                                                                                                                                              FOR UPDATE
                                                                                                                                                                              TO authenticated
                                                                                                                                                                              USING (public.current_app_user_can_manage_rights(userid))
                                                                                                                                                                              WITH CHECK (public.current_app_user_can_manage_rights(userid));

                                                                                                                                                                              CREATE POLICY admin_user_rights_delete
                                                                                                                                                                              ON public.user_module_rights
                                                                                                                                                                              FOR DELETE
                                                                                                                                                                              TO authenticated
                                                                                                                                                                              USING (public.current_app_user_can_manage_rights(userid));

                                                                                                                                                                              COMMIT;