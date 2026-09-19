export function getSafeReturnPath(value: string | string[] | null | undefined, fallback = "/species") {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (candidate === undefined || candidate === null || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return fallback;
  }

  try {
    const baseUrl = new URL("http://biodiversity-hub.local");
    const targetUrl = new URL(candidate, baseUrl);
    if (targetUrl.origin !== baseUrl.origin) return fallback;
    return `${targetUrl.pathname}${targetUrl.search}`;
  } catch {
    return fallback;
  }
}
