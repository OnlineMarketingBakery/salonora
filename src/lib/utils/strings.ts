export function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

export function toPlainText(maybeHtml: string): string {
  if (!maybeHtml) return "";
  return stripTags(maybeHtml);
}
