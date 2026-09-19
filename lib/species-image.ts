/** Wikimedia no longer serves arbitrary thumbnail widths such as the seed's 440px. */
export function speciesImageSources(value: string | null): string[] {
  if (!value?.trim()) return [];

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return [];
    if (!["upload.wikimedia.org", "thumb.wikimedia.org"].includes(url.hostname) || !url.pathname.includes("/thumb/"))
      return [url.href];

    const thumbnail = new URL(url);
    thumbnail.pathname = thumbnail.pathname.replace(/\/\d+px-([^/]+)$/, "/960px-$1");
    const original = new URL(url);
    original.hostname = "upload.wikimedia.org";
    original.pathname = original.pathname.replace("/thumb/", "/").replace(/\/[^/]+$/, "");

    // Raster originals also work when the thumbnail service is temporarily unavailable.
    return /\.(jpe?g|png|webp)$/i.test(original.pathname)
      ? [...new Set([thumbnail.href, original.href])]
      : [thumbnail.href];
  } catch {
    return [];
  }
}
