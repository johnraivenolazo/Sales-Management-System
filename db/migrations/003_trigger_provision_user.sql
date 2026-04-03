-- Sprint 1 / M4 / db/trigger-provision-user
-- Provisions every new auth user into the HopeSMS rights model.

BEGIN;

CREATE OR REPLACE FUNCTION public.provision_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_username TEXT;
  base_username TEXT;
  final_username TEXT;
BEGIN
  requested_username := NULLIF(TRIM(NEW.raw_user_meta_data ->> 'username'), '');

  base_username := LOWER(
    REGEXP_REPLACE(
      COALESCE(
        requested_username,
        SPLIT_PART(COALESCE(NEW.email, ''), '@', 1),
        'user'
      ),
      '[^a-zA-Z0-9_]+',
      '_',
      'g'
    )
  );

  final_username := LEFT(NULLIF(base_username, ''), 40);

  IF final_username IS NULL THEN
    final_username := 'user_' || SUBSTRING(REPLACE(NEW.id::TEXT, '-', '') FROM 1 FOR 8);
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public."user" existing_user
    WHERE existing_user.username = final_username
      AND existing_user.userId <> NEW.id::TEXT
  ) THEN
    final_username := LEFT(final_username, 31) || '_' || SUBSTRING(REPLACE(NEW.id::TEXT, '-', '') FROM 1 FOR 8);
  END IF;

  INSERT INTO public."user" (
    userId,
    username,
    email,
    first_name,
    last_name,
    user_type,
    record_status,
    stamp
  )
  VALUES (
    NEW.id::TEXT,
    final_username,
    NEW.email,
    NULLIF(TRIM(NEW.raw_user_meta_data ->> 'first_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data ->> 'last_name'), ''),
    'USER',
    'INACTIVE',
    'PROVISIONED'
  )
  ON CONFLICT (userId) DO UPDATE
  SET
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    user_type = 'USER',
    record_status = 'INACTIVE',
    stamp = 'PROVISIONED';

  INSERT INTO public.user_module (
    userId,
    module_code,
    rights_value,
    record_status,
    stamp
  )
  SELECT
    NEW.id::TEXT,
    module_code,
    CASE
      WHEN module_code = 'Adm_Mod' THEN 0
      ELSE 1
    END,
    'ACTIVE',
    'PROVISIONED'
  FROM public.module
  WHERE module_code IN ('Sales_Mod', 'SD_Mod', 'Lookup_Mod', 'Adm_Mod')
  ON CONFLICT (userId, module_code) DO UPDATE
  SET
    rights_value = EXCLUDED.rights_value,
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
    NEW.id::TEXT,
    right_code,
    CASE
      WHEN right_code IN (
        'SALES_VIEW',
        'SD_VIEW',
        'CUST_LOOKUP',
        'EMP_LOOKUP',
        'PROD_LOOKUP',
        'PRICE_LOOKUP'
      ) THEN 1
      ELSE 0
    END,
    'ACTIVE',
    'PROVISIONED'
  FROM public.rights
  ON CONFLICT (userId, right_code) DO UPDATE
  SET
    right_value = EXCLUDED.right_value,
    record_status = EXCLUDED.record_status,
    stamp = EXCLUDED.stamp;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.provision_new_user();

COMMIT;
