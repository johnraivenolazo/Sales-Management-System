-- Sprint 1 / M3 / db/rights-seed
-- Rights and admin-side seed tables described in the HopeSMS docs.
-- This migration intentionally seeds only the documented SUPERADMIN account.

BEGIN;

CREATE TABLE IF NOT EXISTS "user" (
  userId VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('SUPERADMIN', 'ADMIN', 'USER')),
  record_status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE' CHECK (record_status IN ('ACTIVE', 'INACTIVE')),
  stamp VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS module (
  module_code VARCHAR(20) PRIMARY KEY,
  module_name VARCHAR(60) NOT NULL,
  record_status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE' CHECK (record_status IN ('ACTIVE', 'INACTIVE')),
  stamp VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS rights (
  right_code VARCHAR(30) PRIMARY KEY,
  right_name VARCHAR(80) NOT NULL,
  sort_order INTEGER NOT NULL,
  module_code VARCHAR(20) NOT NULL REFERENCES module(module_code),
  record_status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE' CHECK (record_status IN ('ACTIVE', 'INACTIVE')),
  stamp VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS user_module (
  userId VARCHAR(50) NOT NULL REFERENCES "user"(userId),
  module_code VARCHAR(20) NOT NULL REFERENCES module(module_code),
  rights_value SMALLINT NOT NULL CHECK (rights_value IN (0, 1)),
  record_status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE' CHECK (record_status IN ('ACTIVE', 'INACTIVE')),
  stamp VARCHAR(60),
  PRIMARY KEY (userId, module_code)
);

CREATE TABLE IF NOT EXISTS user_module_rights (
  userId VARCHAR(50) NOT NULL REFERENCES "user"(userId),
  right_code VARCHAR(30) NOT NULL REFERENCES rights(right_code),
  right_value SMALLINT NOT NULL CHECK (right_value IN (0, 1)),
  record_status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE' CHECK (record_status IN ('ACTIVE', 'INACTIVE')),
  stamp VARCHAR(60),
  PRIMARY KEY (userId, right_code)
);

INSERT INTO module (module_code, module_name, record_status, stamp) VALUES
  ('Sales_Mod',  'Sales Module',        'ACTIVE', 'SEEDED'),
  ('SD_Mod',     'Sales Detail Module', 'ACTIVE', 'SEEDED'),
  ('Lookup_Mod', 'Lookup Module',       'ACTIVE', 'SEEDED'),
  ('Adm_Mod',    'Admin Module',        'ACTIVE', 'SEEDED')
ON CONFLICT (module_code) DO UPDATE SET
  module_name = EXCLUDED.module_name,
  record_status = EXCLUDED.record_status,
  stamp = EXCLUDED.stamp;

INSERT INTO rights (right_code, right_name, sort_order, module_code, record_status, stamp) VALUES
  ('SALES_VIEW',  'View Transactions',       1, 'Sales_Mod',  'ACTIVE', 'SEEDED'),
  ('SALES_ADD',   'Create Transaction',      2, 'Sales_Mod',  'ACTIVE', 'SEEDED'),
  ('SALES_EDIT',  'Edit Transaction',        3, 'Sales_Mod',  'ACTIVE', 'SEEDED'),
  ('SALES_DEL',   'Soft Delete Transaction', 4, 'Sales_Mod',  'ACTIVE', 'SEEDED'),
  ('SD_VIEW',     'View Sales Detail',       5, 'SD_Mod',     'ACTIVE', 'SEEDED'),
  ('SD_ADD',      'Add Line Item',           6, 'SD_Mod',     'ACTIVE', 'SEEDED'),
  ('SD_EDIT',     'Edit Line Item',          7, 'SD_Mod',     'ACTIVE', 'SEEDED'),
  ('SD_DEL',      'Soft Delete Line Item',   8, 'SD_Mod',     'ACTIVE', 'SEEDED'),
  ('CUST_LOOKUP', 'Look Up Customers',       9, 'Lookup_Mod', 'ACTIVE', 'SEEDED'),
  ('EMP_LOOKUP',  'Look Up Employees',      10, 'Lookup_Mod', 'ACTIVE', 'SEEDED'),
  ('PROD_LOOKUP', 'Look Up Products',       11, 'Lookup_Mod', 'ACTIVE', 'SEEDED'),
  ('PRICE_LOOKUP','Look Up Price History',  12, 'Lookup_Mod', 'ACTIVE', 'SEEDED'),
  ('ADM_USER',    'Admin Activate User',    13, 'Adm_Mod',    'ACTIVE', 'SEEDED')
ON CONFLICT (right_code) DO UPDATE SET
  right_name = EXCLUDED.right_name,
  sort_order = EXCLUDED.sort_order,
  module_code = EXCLUDED.module_code,
  record_status = EXCLUDED.record_status,
  stamp = EXCLUDED.stamp;

INSERT INTO "user" (userId, username, email, first_name, last_name, user_type, record_status, stamp) VALUES
  ('user1', 'jcesperanza', 'jcesperanza@neu.edu.ph', 'Jeremias', 'Esperanza', 'SUPERADMIN', 'ACTIVE', 'SEEDED')
ON CONFLICT (userId) DO UPDATE SET
  username = EXCLUDED.username,
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  user_type = EXCLUDED.user_type,
  record_status = EXCLUDED.record_status,
  stamp = EXCLUDED.stamp;

INSERT INTO user_module (userId, module_code, rights_value, record_status, stamp) VALUES
  ('user1', 'Sales_Mod',  1, 'ACTIVE', 'SEEDED'),
  ('user1', 'SD_Mod',     1, 'ACTIVE', 'SEEDED'),
  ('user1', 'Lookup_Mod', 1, 'ACTIVE', 'SEEDED'),
  ('user1', 'Adm_Mod',    1, 'ACTIVE', 'SEEDED')
ON CONFLICT (userId, module_code) DO UPDATE SET
  rights_value = EXCLUDED.rights_value,
  record_status = EXCLUDED.record_status,
  stamp = EXCLUDED.stamp;

INSERT INTO user_module_rights (userId, right_code, right_value, record_status, stamp) VALUES
  ('user1', 'SALES_VIEW',   1, 'ACTIVE', 'SEEDED'),
  ('user1', 'SALES_ADD',    1, 'ACTIVE', 'SEEDED'),
  ('user1', 'SALES_EDIT',   1, 'ACTIVE', 'SEEDED'),
  ('user1', 'SALES_DEL',    1, 'ACTIVE', 'SEEDED'),
  ('user1', 'SD_VIEW',      1, 'ACTIVE', 'SEEDED'),
  ('user1', 'SD_ADD',       1, 'ACTIVE', 'SEEDED'),
  ('user1', 'SD_EDIT',      1, 'ACTIVE', 'SEEDED'),
  ('user1', 'SD_DEL',       1, 'ACTIVE', 'SEEDED'),
  ('user1', 'CUST_LOOKUP',  1, 'ACTIVE', 'SEEDED'),
  ('user1', 'EMP_LOOKUP',   1, 'ACTIVE', 'SEEDED'),
  ('user1', 'PROD_LOOKUP',  1, 'ACTIVE', 'SEEDED'),
  ('user1', 'PRICE_LOOKUP', 1, 'ACTIVE', 'SEEDED'),
  ('user1', 'ADM_USER',     1, 'ACTIVE', 'SEEDED')
ON CONFLICT (userId, right_code) DO UPDATE SET
  right_value = EXCLUDED.right_value,
  record_status = EXCLUDED.record_status,
  stamp = EXCLUDED.stamp;

COMMIT;
