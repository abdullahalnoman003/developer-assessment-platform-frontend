const INTERNAL_PREFIX = /^\/(?!\/)/;

export function safeRedirect(
  target: string | null | undefined,
  fallback: string,
): string {
  if (typeof target !== "string") return fallback;
  const value = target.trim();
  if (!value) return fallback;
  if (value.includes("\\")) return fallback;
  if (value.includes("://")) return fallback;
  if (!INTERNAL_PREFIX.test(value)) return fallback;
  return value;
}
