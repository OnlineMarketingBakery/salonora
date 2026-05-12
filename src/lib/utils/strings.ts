export function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

/** URL-safe fragment id from visible heading text. */
export function slugifyHeadingFragment(text: string): string {
  const base = stripTags(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return base || "section";
}

export function toPlainText(maybeHtml: string): string {
  if (!maybeHtml) return "";
  return stripTags(maybeHtml);
}
