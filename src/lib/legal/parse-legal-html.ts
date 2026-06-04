export type LegalHeading = { id: string; label: string };

const H2_RE = /<h2[^>]*\sid=["']([^"']+)["'][^>]*>([^<]*)<\/h2>/gi;
const LEAD_RE = /<p\s+class=["']legal-lead["'][^>]*>[\s\S]*?<\/p>/i;

/** Table of contents entries from `<h2 id="…">` in legal HTML. */
export function extractLegalHeadings(html: string): LegalHeading[] {
  const headings: LegalHeading[] = [];
  let m: RegExpExecArray | null;
  H2_RE.lastIndex = 0;
  while ((m = H2_RE.exec(html)) !== null) {
    const label = m[2].replace(/\s+/g, " ").trim();
    if (label) headings.push({ id: m[1], label });
  }
  return headings;
}

/** Split hero lead paragraph from the rest of the legal body. */
export function splitLegalLead(html: string): { leadHtml: string; bodyHtml: string } {
  const leadMatch = html.match(LEAD_RE);
  if (!leadMatch) return { leadHtml: "", bodyHtml: html };
  const leadHtml = leadMatch[0];
  const bodyHtml = html.replace(leadHtml, "").trim();
  return { leadHtml, bodyHtml };
}

const WP_BOILERPLATE_RE =
  /Suggested text|Gravatar service|post ID of the article you just edited|Anonymized string created from your email address/i;

/** WordPress auto-generated privacy policy template (not Salonora copy). */
export function isWordPressPrivacyBoilerplate(html: string): boolean {
  const text = html.replace(/<[^>]+>/g, " ");
  return WP_BOILERPLATE_RE.test(text);
}

export function stripHtmlToText(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}
