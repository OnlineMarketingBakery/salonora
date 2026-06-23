/**
 * Decode common HTML entities from plain CMS strings (ACF text fields sometimes
 * store `&amp;` literally). Safe for SSR; does not execute HTML.
 */
export function decodeHtmlEntitiesPlain(text: string): string {
  let out = text
    .replace(/&nbsp;/gi, " ")
    .replace(/&#0*160;/g, " ")
    .replace(/&#x0*a0;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#0*39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, "\u201C")
    .replace(/&#8221;/g, "\u201D")
    .replace(/&#8211;/g, "\u2013")
    .replace(/&#8212;/g, "\u2014");

  out = out.replace(/&#(\d+);/g, (_, code) => {
    const n = Number(code);
    return Number.isFinite(n) ? String.fromCodePoint(n) : _;
  });
  out = out.replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
    const n = parseInt(hex, 16);
    return Number.isFinite(n) ? String.fromCodePoint(n) : _;
  });
  return out;
}
