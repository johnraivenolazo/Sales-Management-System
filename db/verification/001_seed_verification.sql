-- Sprint 1 / M3 / db/verify-seed
-- Verification queries for the HopeSMS seed set.
--
-- Important note:
-- The current project docs summarize some row counts approximately or with older values.
-- The raw HopeDB (3).sql source currently contains these exact insert counts:
--   employee    = 32
--   customer    = 82
--   sales       = 124
--   product     = 57
--   salesDetail = 313
--   priceHist   = 79

-- Core row counts from the raw HopeDB seed source
SELECT 'employee' AS table_name, COUNT(*) AS actual_count, 32 AS expected_from_source FROM employee
UNION ALL
SELECT 'customer', COUNT(*), 82 FROM customer
UNION ALL
SELECT 'sales', COUNT(*), 124 FROM sales
UNION ALL
SELECT 'product', COUNT(*), 57 FROM product
UNION ALL
SELECT 'salesDetail', COUNT(*), 313 FROM salesDetail
UNION ALL
SELECT 'priceHist', COUNT(*), 79 FROM priceHist;

-- Rights-side seed counts from the M3 rights seed migration
SELECT 'user' AS table_name, COUNT(*) AS actual_count, 1 AS expected_seed_rows FROM "user"
UNION ALL
SELECT 'module', COUNT(*), 4 FROM module
UNION ALL
SELECT 'rights', COUNT(*), 13 FROM rights
UNION ALL
SELECT 'user_module', COUNT(*), 4 FROM user_module
UNION ALL
SELECT 'user_module_rights', COUNT(*), 13 FROM user_module_rights;

-- sales -> customer FK integrity
SELECT COUNT(*) AS sales_without_customer
FROM sales s
LEFT JOIN customer c ON c.custno = s.custNo
WHERE c.custno IS NULL;

-- sales -> employee FK integrity
SELECT COUNT(*) AS sales_without_employee
FROM sales s
LEFT JOIN employee e ON e.empno = s.empNo
WHERE e.empno IS NULL;

-- salesDetail -> sales FK integrity
SELECT COUNT(*) AS salesdetail_without_sales
FROM salesDetail sd
LEFT JOIN sales s ON s.transNo = sd.transNo
WHERE s.transNo IS NULL;

-- salesDetail -> product FK integrity
SELECT COUNT(*) AS salesdetail_without_product
FROM salesDetail sd
LEFT JOIN product p ON p.prodCode = sd.prodCode
WHERE p.prodCode IS NULL;

-- priceHist -> product FK integrity
SELECT COUNT(*) AS pricehist_without_product
FROM priceHist ph
LEFT JOIN product p ON p.prodCode = ph.prodCode
WHERE p.prodCode IS NULL;

-- Seeded SUPERADMIN should have one row per module
SELECT userId, COUNT(*) AS module_rows
FROM user_module
WHERE userId = 'user1'
GROUP BY userId;

-- Seeded SUPERADMIN should have all 13 rights enabled
SELECT
  userId,
  COUNT(*) AS right_rows,
  SUM(right_value) AS enabled_rights
FROM user_module_rights
WHERE userId = 'user1'
GROUP BY userId;
