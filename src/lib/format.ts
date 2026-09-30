import type { JsonValue } from "./types";

/* ------------------------------------------------------------------ JSON */

/**
 * The backend returns some string columns as Prisma `Json` and others as
 * `String`. Everything goes through here so views never have to branch.
 */

export function toStringList(
  value: JsonValue | string | null | undefined,
): string[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string => typeof item === "string" && item.length > 0,
    );
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[")) {
      try {
        const parsed: unknown = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (item): item is string =>
              typeof item === "string" && item.length > 0,
          );
        }
      } catch {
        return trimmed
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }
    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

/** Options may arrive as a string, an array, or a JSON-encoded array. */
export function toOptionList(value: JsonValue | null | undefined): string[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "text" in item) {
          const text = (item as { text?: unknown }).text;
          if (typeof text === "string") return text;
        }
        return "";
      })
      .filter(Boolean);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("[")) {
      try {
        return toOptionList(JSON.parse(trimmed) as JsonValue);
      } catch {
        return [trimmed];
      }
    }
    return trimmed ? [trimmed] : [];
  }
  return [];
}

/** The correct answer may be the option text, an index, or a JSON value. */
export function correctAnswerLabel(
  value: JsonValue | null | undefined,
  options: string[],
): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    const text = options[value];
    return text ?? String(value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    const asIndex = Number(trimmed);
    if (
      options.length > 0 &&
      trimmed !== "" &&
      Number.isInteger(asIndex) &&
      asIndex >= 0 &&
      asIndex < options.length
    ) {
      return options[asIndex];
    }
    return trimmed;
  }
  if (Array.isArray(value) || typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

export function isJsonEmpty(value: JsonValue | null | undefined): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

/* ----------------------------------------------------------------- Dates */

export function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(
  value: string | Date | null | undefined,
  fallback = "—",
): string {
  const date = toDate(value);
  if (!date) return fallback;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(
  value: string | Date | null | undefined,
  fallback = "—",
): string {
  const date = toDate(value);
  if (!date) return fallback;
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelative(
  value: string | Date | null | undefined,
  fallback = "—",
): string {
  const date = toDate(value);
  if (!date) return fallback;
  const diffMs = date.getTime() - Date.now();
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000_000],
    ["month", 2_592_000_000],
    ["week", 604_800_000],
    ["day", 86_400_000],
    ["hour", 3_600_000],
    ["minute", 60_000],
  ];
  for (const [unit, ms] of units) {
    if (Math.abs(diffMs) >= ms || unit === "minute") {
      return formatter.format(Math.round(diffMs / ms), unit);
    }
  }
  return fallback;
}

/** `02:14:59` — used by the attempt countdown. */
export function formatCountdown(
  target: string | Date | null | undefined,
): string {
  const date = toDate(target);
  if (!date) return "00:00:00";
  const remaining = Math.max(0, date.getTime() - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

export function isPast(value: string | Date | null | undefined): boolean {
  const date = toDate(value);
  return date ? date.getTime() < Date.now() : false;
}

/* --------------------------------------------------------------- Numbers */

export function formatCurrency(
  value: string | number | null | undefined,
  currency = "BDT",
): string {
  if (value === null || value === undefined) return "—";
  const amount = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(
  value: number | null | undefined,
  fallback = "—",
): string {
  if (value === null || value === undefined || Number.isNaN(value))
    return fallback;
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercent(
  value: number | null | undefined,
  digits = 0,
  fallback = "—",
): string {
  if (value === null || value === undefined || Number.isNaN(value))
    return fallback;
  return `${value.toFixed(digits)}%`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/* ----------------------------------------------------------------- Text */

export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}

export function truncate(
  value: string | null | undefined,
  max: number,
  fallback = "—",
): string {
  if (!value) return fallback;
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;
}

export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`,
): string {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`;
}

export function isValidHttpUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  return zodUrl(value);
}

function zodUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
