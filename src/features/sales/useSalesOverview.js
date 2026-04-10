import { useEffect, useMemo, useState } from "react";
import { getCustomers, getEmployees } from "../../services/lookupService.js";
import { getSales } from "../../services/salesService.js";
import { supabase } from "../../lib/supabaseClient.js";
import { buildFullName } from "./salesFormatting.js";

function buildLookupMap(rows, keyName) {
  return (rows ?? []).reduce((lookupMap, row) => {
    lookupMap[row[keyName]] = row;
    return lookupMap;
  }, {});
}

function buildDetailStatsMap(details) {
  return (details ?? []).reduce((statsMap, detail) => {
    if (!statsMap[detail.transNo]) {
      statsMap[detail.transNo] = {
        lineCount: 0,
        totalQuantity: 0,
        totalAmount: 0,
      };
    }

    const unitPrice = Number(detail.unitPrice ?? 0);
    statsMap[detail.transNo].lineCount += 1;
    statsMap[detail.transNo].totalQuantity += Number(detail.quantity ?? 0);
    statsMap[detail.transNo].totalAmount += Number(detail.quantity ?? 0) * unitPrice;

    return statsMap;
  }, {});
}

async function getVisibleDetails(userType) {
  if (!supabase) {
    return [];
  }

  let query = supabase
    .from("salesdetail")
    .select("transNo:transno, prodCode:prodcode, quantity, unitPrice:unitprice_snapshot, record_status");

  if (String(userType ?? "").toUpperCase() === "USER") {
    query = query.eq("record_status", "ACTIVE");
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}

function buildEnrichedSales({
  customers,
  employees,
  details,
  sales,
}) {
  const customerMap = buildLookupMap(customers, "custno");
  const employeeMap = buildLookupMap(employees, "empno");
  const detailStatsMap = buildDetailStatsMap(details);

  return (sales ?? []).map((sale) => {
    const customer = customerMap[sale.custNo];
    const employee = employeeMap[sale.empNo];
    const stats = detailStatsMap[sale.transNo] ?? {
      lineCount: 0,
      totalQuantity: 0,
      totalAmount: 0,
    };

    return {
      ...sale,
      customerName: customer?.custname ?? "Unknown customer",
      employeeName: buildFullName(employee),
      payterm: customer?.payterm ?? "N/A",
      lineCount: stats.lineCount,
      totalQuantity: stats.totalQuantity,
      totalAmount: stats.totalAmount,
    };
  });
}

export function useSalesOverview(userType) {
  const [sales, setSales] = useState([]);
  const [reloadToken, setReloadToken] = useState(0);
  const [filters, setFilters] = useState({
    query: "",
    customer: "ALL",
    startDate: "",
    endDate: "",
    status: "VISIBLE",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOverview() {
      setIsLoading(true);
      setError("");

      try {
        const [salesRows, customerRows, employeeRows, detailRows] =
          await Promise.all([
            getSales(userType),
            getCustomers(),
            getEmployees(),
            getVisibleDetails(userType),
          ]);

        if (!active) {
          return;
        }

        setSales(
          buildEnrichedSales({
            customers: customerRows,
            employees: employeeRows,
            details: detailRows,
            sales: salesRows,
          }),
        );
        setIsLoading(false);
      } catch (nextError) {
        if (!active) {
          return;
        }

        setError(nextError.message ?? "Unable to load the sales overview.");
        setIsLoading(false);
      }
    }

    void loadOverview();

    return () => {
      active = false;
    };
  }, [reloadToken, userType]);

  const filteredSales = useMemo(() => {
    const normalizedQuery = filters.query.trim().toLowerCase();
    const normalizedStatus = String(filters.status ?? "VISIBLE").toUpperCase();

    return sales.filter((sale) => {
      const matchesQuery =
        !normalizedQuery ||
        sale.transNo.toLowerCase().includes(normalizedQuery) ||
        sale.customerName.toLowerCase().includes(normalizedQuery) ||
        sale.employeeName.toLowerCase().includes(normalizedQuery);

      const matchesCustomer =
        filters.customer === "ALL" || sale.custNo === filters.customer;

      const matchesStartDate =
        !filters.startDate || sale.salesDate >= filters.startDate;

      const matchesEndDate =
        !filters.endDate || sale.salesDate <= filters.endDate;

      const matchesStatus =
        normalizedStatus === "VISIBLE" ||
        sale.record_status === normalizedStatus;

      return (
        matchesQuery &&
        matchesCustomer &&
        matchesStartDate &&
        matchesEndDate &&
        matchesStatus
      );
    });
  }, [filters, sales]);

  const metrics = useMemo(() => {
    return filteredSales.reduce(
      (summary, sale) => {
        summary.totalTransactions += 1;
        summary.totalLineItems += sale.lineCount;
        summary.totalQuantity += sale.totalQuantity;
        summary.totalAmount += sale.totalAmount;
        return summary;
      },
      {
        totalTransactions: 0,
        totalLineItems: 0,
        totalQuantity: 0,
        totalAmount: 0,
      },
    );
  }, [filteredSales]);

  const customerOptions = useMemo(() => {
    const uniqueCustomers = new Map();

    sales.forEach((sale) => {
      uniqueCustomers.set(sale.custNo, {
        value: sale.custNo,
        label: sale.customerName,
      });
    });

    return Array.from(uniqueCustomers.values()).sort((left, right) =>
      left.label.localeCompare(right.label),
    );
  }, [sales]);

  const employeeOptions = useMemo(() => {
    const uniqueEmployees = new Map();

    sales.forEach((sale) => {
      uniqueEmployees.set(sale.empNo, {
        value: sale.empNo,
        label: sale.employeeName,
      });
    });

    return Array.from(uniqueEmployees.values()).sort((left, right) =>
      left.label.localeCompare(right.label),
    );
  }, [sales]);

  return {
    allSales: sales,
    sales: filteredSales,
    metrics,
    filters,
    setFilters,
    customerOptions,
    employeeOptions,
    isLoading,
    error,
    refreshOverview: () => setReloadToken((currentValue) => currentValue + 1),
  };
}
