const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

export function formatCompactNumber(value) {
  return compactNumberFormatter.format(Number(value ?? 0));
}

export function getMaxValue(rows, selectValue) {
  return (rows ?? []).reduce((maxValue, row) => {
    return Math.max(maxValue, Number(selectValue(row) ?? 0));
  }, 0);
}

export function formatMonthLabel(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return monthFormatter.format(date);
}
