/** Ensure plain-text CMS answers render correctly inside RichText / prose. */
export function formatFaqAnswer(raw: string): string {
  const text = String(raw || "").trim();
  if (!text) return "";
  if (/<[a-z][\s\S]*>/i.test(text)) return text;
  return `<p>${text}</p>`;
}
