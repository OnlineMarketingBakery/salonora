/**
 * Decode common HTML entities from plain CMS strings (ACF text fields sometimes
 * store `&amp;` literally). Safe for SSR; does not execute HTML.
 */
export function decodeHtmlEntitiesPlain(text: string): string {
  return text
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&#x27;/gi, "'");
}
