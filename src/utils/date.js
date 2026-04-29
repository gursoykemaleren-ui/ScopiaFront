function normalizeUtcDate(value) {
  if (!value) return null;

  if (
    typeof value === "string" &&
    !value.endsWith("Z") &&
    !value.includes("+")
  ) {
    return `${value}Z`;
  }

  return value;
}

export function formatDateTimeTR(value) {
  const normalized = normalizeUtcDate(value);
  if (!normalized) return "-";

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatDateTR(value) {
  const normalized = normalizeUtcDate(value);
  if (!normalized) return "-";

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}