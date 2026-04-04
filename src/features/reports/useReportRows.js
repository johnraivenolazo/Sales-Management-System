import { useEffect, useState } from "react";

export function useReportRows(loadRows) {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;

    async function run() {
      try {
        if (active) {
          setIsLoading(true);
          setError("");
        }

        const nextRows = await loadRows();

        if (!active) {
          return;
        }

        setRows(nextRows);
        setIsLoading(false);
      } catch (nextError) {
        if (!active) {
          return;
        }

        setRows([]);
        setError(nextError.message ?? "Unable to load the report.");
        setIsLoading(false);
      }
    }

    void run();

    return () => {
      active = false;
    };
  }, [loadRows, reloadToken]);

  return {
    rows,
    isLoading,
    error,
    reload: () => setReloadToken((currentValue) => currentValue + 1),
  };
}
