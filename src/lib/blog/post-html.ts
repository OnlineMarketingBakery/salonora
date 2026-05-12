import { slugifyHeadingFragment, stripTags } from "@/lib/utils/strings";

export type PostTocItem = { id: string; label: string; level: 2 | 3 };

const SALONORA_WRAPPER_CLASS_RE =
  /salonora-tip|salonora-callout|salonora-warn|salonora-checklist|salonora-inline-cta|salonora-cta-panel|salonora-tinted/i;

/**
 * Wrapper `class` substrings on `<div>`: entire subtree is removed before TOC extraction, so `h2`/`h3`
 * inside do not appear in the TOC (see globals.css for matching heading styles / no section pills).
 * `salonora-tinted` = generic non‑white band in post HTML — use for any tinted block not covered by tip/callout/etc.
 */
const TOC_SKIP_WRAPPER_CLASS_RE = SALONORA_WRAPPER_CLASS_RE;

function classAttrMatchesTocSkip(classAttr: string): boolean {
  return TOC_SKIP_WRAPPER_CLASS_RE.test(classAttr);
}

function findNextCalloutDivOpen(html: string, from: number): { start: number; openEnd: number } | null {
  const re = /<div\b[^>]*\bclass\s*=\s*(["'])((?:(?!\1).)*)\1[^>]*>/gi;
  re.lastIndex = from;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    if (classAttrMatchesTocSkip(m[2])) {
      return { start: m.index, openEnd: m.index + m[0].length };
    }
  }
  return null;
}

/** First `</div>` that balances depth from 1 after `openEnd` (naive: only `div` tags). */
function findMatchingDivCloseIndex(html: string, openEnd: number): number {
  let depth = 1;
  const re = /<\/?div\b[^>]*>/gi;
  re.lastIndex = openEnd;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const tag = m[0];
    if (/^<\/div\b/i.test(tag)) depth -= 1;
    else depth += 1;
    if (depth === 0) return m.index + tag.length;
  }
  return -1;
}

/** Remove callout/card wrapper HTML so `h2`/`h3` inside them are not picked up for TOC. */
export function stripCalloutBlocksForToc(html: string): string {
  let result = html;
  for (let i = 0; i < 500; i++) {
    const hit = findNextCalloutDivOpen(result, 0);
    if (!hit) break;
    const close = findMatchingDivCloseIndex(result, hit.openEnd);
    if (close === -1) break;
    result = result.slice(0, hit.start) + result.slice(close);
  }
  return result;
}

function extractFirstCssDeclaration(style: string, prop: string): string | null {
  const re = new RegExp(`\\b${prop}\\s*:\\s*([^;]+)`, "i");
  const m = style.match(re);
  return m ? m[1].trim() : null;
}

function cssColorValueLooksWhiteish(value: string): boolean {
  const v = value.trim().toLowerCase();
  if (!v || v === "transparent" || v === "none") return true;
  if (v === "white") return true;
  if (/#fff\b|#ffffff\b/.test(v)) return true;
  const rgb = v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgb) {
    const r = Number(rgb[1]);
    const g = Number(rgb[2]);
    const b = Number(rgb[3]);
    if (r >= 253 && g >= 253 && b >= 253) return true;
  }
  return false;
}

/** True when inline `style` sets a visible non-(near-)white background (shorthand or background-color). */
function styleDeclaresNonWhiteBackground(style: string): boolean {
  const bg = extractFirstCssDeclaration(style, "background");
  const bgc = extractFirstCssDeclaration(style, "background-color");
  const candidates = [bg, bgc].filter((s): s is string => Boolean(s && s.length));
  if (candidates.length === 0) return false;
  for (const val of candidates) {
    if (/\b(?:linear|radial)-gradient\s*\(/i.test(val)) return true;
    if (!cssColorValueLooksWhiteish(val)) return true;
  }
  return false;
}

/**
 * Plain `<div style="background:#…">` bands (no Salonora class) still need TOC + numbering rules.
 * Inject `salonora-tinted` when inline background is clearly not (near-)white.
 */
export function markStyleTintedDivs(html: string): string {
  if (!html) return html;
  return html.replace(/<div(\s[^>]*)>/gi, (full, attrs: string) => {
    if (/\bsalonora-tinted\b/i.test(attrs)) return full;
    const classMatch = attrs.match(/\bclass\s*=\s*(["'])((?:\\.|(?!\1).)*)\1/i);
    if (classMatch && SALONORA_WRAPPER_CLASS_RE.test(classMatch[2])) return full;

    const styleMatch = attrs.match(/\bstyle\s*=\s*(["'])((?:\\.|(?!\1).)*)\1/i);
    if (!styleMatch) return full;
    if (!styleDeclaresNonWhiteBackground(styleMatch[2])) return full;

    if (classMatch) {
      const q = classMatch[1];
      const classes = classMatch[2].trimEnd();
      const newAttrs = attrs.replace(classMatch[0], `class=${q}${classes} salonora-tinted${q}`);
      return `<div${newAttrs}>`;
    }
    return `<div class="salonora-tinted"${attrs}>`;
  });
}

/**
 * Adds stable `id` attributes to h2/h3 for TOC anchors when missing.
 * Handles duplicate slugs by suffixing -2, -3, …
 */
export function injectHeadingIds(html: string): string {
  if (!html) return html;
  const used = new Set<string>();
  return html.replace(/<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi, (full, level: string, attrs: string | undefined, inner: string) => {
    const attrStr = attrs || "";
    if (/\bid\s*=\s*["'][^"']*["']/i.test(attrStr)) {
      return full;
    }
    const base = slugifyHeadingFragment(inner);
    let id = base;
    let n = 2;
    while (used.has(id)) {
      id = `${base}-${n}`;
      n += 1;
    }
    used.add(id);
    const open = `<h${level}${attrStr} id="${id}">`;
    return `${open}${inner}</h${level}>`;
  });
}

export function extractPostToc(html: string): PostTocItem[] {
  const items: PostTocItem[] = [];
  const cleaned = stripCalloutBlocksForToc(html);
  const re = /<h([23])(?:\s[^>]*)?\bid=["']([^"']+)["'][^>]*>([\s\S]*?)<\/h\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cleaned)) !== null) {
    const level = Number(m[1]) as 2 | 3;
    if (level !== 2 && level !== 3) continue;
    items.push({ id: m[2], label: stripTags(m[3]).trim() || m[2], level });
  }
  return items;
}
