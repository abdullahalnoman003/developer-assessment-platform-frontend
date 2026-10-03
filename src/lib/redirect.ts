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

const WEB_PROTOCOLS = new Set(["http:", "https:"]);

// an off-origin URL handed back by the API must be a real web address
export function safeExternalUrl(
  target: string | null | undefined,
): string | null {
  if (typeof target !== "string") return null;
  const value = target.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    return WEB_PROTOCOLS.has(url.protocol) ? value : null;
  } catch {
    return null;
  }
}
