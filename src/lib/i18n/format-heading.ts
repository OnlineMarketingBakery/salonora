import { stripTags } from "@/lib/utils/strings";

const HTML_TAG_RE = /<[a-z][\s\S]*>/i;

/** Proper nouns / brands restored after sentence-case lowercasing. */
const PROPER_NOUN_ALLOWLIST = [
  "Salonora",
  "WhatsApp",
  "Instagram",
  "Facebook",
  "Gmail",
  "Excel",
  "Slack",
  "Calendly",
  "Teamwork",
  "Polylang",
  "WordPress",
  "Google",
  "iPhone",
  "iPad",
] as const;

function hasHtmlMarkup(text: string): boolean {
  return HTML_TAG_RE.test(text);
}

function capitalizeFirstLetter(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function restoreProperNouns(line: string): string {
  let out = line;
  for (const noun of PROPER_NOUN_ALLOWLIST) {
    const re = new RegExp(noun.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    out = out.replace(re, noun);
  }
  return out;
}

function formatHeadingLine(line: string): string {
  const trimmed = line.trim();
  if (!trimmed) return trimmed;
  const lower = trimmed.toLocaleLowerCase("nl-NL");
  return restoreProperNouns(capitalizeFirstLetter(lower));
}

function splitHeadingSource(text: string): string[] {
  if (!text) return [];
  if (hasHtmlMarkup(text)) {
    return text
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>\s*<p[^>]*>/gi, "\n")
      .split(/\r?\n+/)
      .map((line) => stripTags(line).replace(/\s+/g, " ").trim())
      .filter(Boolean);
  }
  return text
    .split(/\r?\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function normalizeHeadingInput(text: string): string {
  const lines = splitHeadingSource(text);
  if (!lines.length) return "";
  return lines.join("\n");
}

/**
 * Dutch sentence-case for plain-text headings: only the first letter is capitalized.
 * Skips rich HTML structure but strips simple CMS wrappers (e.g. `<p>Title</p>`).
 * Preserves known brand names via allowlist.
 */
export function formatHeadingCase(text: string): string {
  const normalized = normalizeHeadingInput(text);
  if (!normalized) return text;
  return formatHeadingLines(normalized).join("\n");
}

/** Multi-line Figma headings — formats each line independently. */
export function formatHeadingLines(text: string): string[] {
  const lines = splitHeadingSource(text);
  if (!lines.length) {
    return text.split(/\r?\n+/).filter((line) => line.trim().length > 0);
  }
  return lines.map((line) => formatHeadingLine(line)).filter((line) => line.length > 0);
}
