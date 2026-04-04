import { useEffect, useMemo, useState } from "react";
import { getCustomers, getEmployees, getPriceHistory, getProducts } from "../../services/lookupService.js";
import { getSales } from "../../services/salesService.js";
import { getDetailByTrans } from "../../services/salesDetailService.js";
import { buildFullName } from "./salesFormatting.js";

function buildLookupMap(rows, keyName) {
  return (rows ?? []).reduce((lookupMap, row) => {
    lookupMap[row[keyName]] = row;
    return lookupMap;
  }, {});
}

function buildLatestPriceMap(priceHistoryRows) {
  return (priceHistoryRows ?? []).reduce((priceMap, row) => {
    if (!priceMap[row.prodCode]) {
      priceMap[row.prodCode] = Number(row.unitPrice ?? 0);
    }

    return priceMap;
  }, {});
}

export function useSalesDetailWorkspace(transNo, userType) {
  const [state, setState] = useState({
    sale: null,
    details: [],
    productOptions: [],
    isLoading: true,
    error: "",
  });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadWorkspace() {
      setState((currentState) => ({
        ...currentState,
        isLoading: true,
        error: "",
      }));

      try {
        const [salesRows, detailRows, customerRows, employeeRows, productRows, priceHistoryRows] =
          await Promise.all([
            getSales(userType),
            getDetailByTrans(transNo, userType),
            getCustomers(),
            getEmployees(),
            getProducts(),
            getPriceHistory(),
          ]);

        if (!active) {
          return;
        }

        const customerMap = buildLookupMap(customerRows, "custno");
        const employeeMap = buildLookupMap(employeeRows, "empno");
        const productMap = buildLookupMap(productRows, "prodCode");
        const latestPriceMap = buildLatestPriceMap(priceHistoryRows);
        const sale = salesRows.find((row) => row.transNo === transNo) ?? null;

        if (!sale) {
          setState({
            sale: null,
            details: [],
            productOptions: [],
            isLoading: false,
            error: `Transaction ${transNo} could not be found for the current role.`,
          });
          return;
        }

        const enrichedSale = {
          ...sale,
          customerName: customerMap[sale.custNo]?.custname ?? "Unknown customer",
          employeeName: buildFullName(employeeMap[sale.empNo]),
        };

        const enrichedDetails = detailRows.map((detail) => {
          const product = productMap[detail.prodCode];
          const unitPrice = Number(latestPriceMap[detail.prodCode] ?? 0);

          return {
            ...detail,
            description: product?.description ?? "Unknown product",
            unit: product?.unit ?? "N/A",
            unitPrice,
            rowTotal: unitPrice * Number(detail.quantity ?? 0),
          };
        });

        setState({
          sale: enrichedSale,
          details: enrichedDetails,
          productOptions: productRows.map((product) => ({
            value: product.prodCode,
            label: `${product.prodCode} · ${product.description}`,
          })),
          isLoading: false,
          error: "",
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setState({
          sale: null,
          details: [],
          productOptions: [],
          isLoading: false,
          error: error.message ?? "Unable to load the transaction detail workspace.",
        });
      }
    }

    void loadWorkspace();

    return () => {
      active = false;
    };
  }, [reloadToken, transNo, userType]);

  const metrics = useMemo(() => {
    return state.details.reduce(
      (summary, detail) => {
        summary.lineCount += 1;
        summary.quantity += Number(detail.quantity ?? 0);
        summary.totalAmount += Number(detail.rowTotal ?? 0);
        return summary;
      },
      {
        lineCount: 0,
        quantity: 0,
        totalAmount: 0,
      },
    );
  }, [state.details]);

  return {
    ...state,
    metrics,
    refreshWorkspace: () => setReloadToken((currentValue) => currentValue + 1),
  };
}
