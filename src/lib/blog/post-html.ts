import { slugifyHeadingFragment, stripTags } from "@/lib/utils/strings";
import type { AnySectionT } from "@/types/sections";

export type PostTocItem = { id: string; label: string; level: 2 | 3 };

/**
 * Remove Gutenberg/HTML paste artifacts that render as empty blocks above the article.
 * WordPress sometimes turns file-header `<!-- … -->` into `<p><!-- … </p>` without `-->`,
 * which makes the browser treat the entire article as one HTML comment (invisible).
 */
export function preparePostContentHtml(html: string): string {
  if (!html) return html;
  let out = html
    .replace(/<p>\s*<!--[\s\S]*?<\/p>/gi, "")
    .replace(/^(?:\s*<\/p>\s*)+/i, "")
    .trim();

  out = stripHtmlComments(out);
  out = upgradeFigmaCalloutBands(out);
  return out.trim();
}

const CALLOUT_BAND_FOOTER =
  '<div class="salonora-band__footer" style="height:6px;background:#3990f0;line-height:0;font-size:0" aria-hidden="true"></div>';

const CALLOUT_LABEL_RE =
  /(?:antwoord\s+in\s+1\s+minuut|maak\s+je\s+salon|avond-proof|pro\s+tip)/i;
const SURFACE_BG_RE = /#(?:ebf3fe|ecf4ff)\b/i;

function wrapSalonoraBand(inner: string): string {
  const bodyStyle = "background:#ebf3fe;padding:30px 32px 26px";
  return `<div class="salonora-band" style="margin:28px 0;border-radius:12px;overflow:hidden"><div class="salonora-band__body" style="${bodyStyle}">${inner}</div>${CALLOUT_BAND_FOOTER}</div>`;
}

/** Figma 1800:2 — full-width brand footer strip; fixes legacy inner 6px “pill” bars. */
export function upgradeFigmaCalloutBands(html: string): string {
  if (!html) return html;
  let out = html.replace(
    /\s*<div[^>]*\bclass\s*=\s*["'][^"']*salonora-tinted[^"']*["'][^>]*style="[^"]*height:\s*6px[^"]*"[^>]*>\s*<\/div>/gi,
    ""
  );
  out = out.replace(
    /\s*<div[^>]*style="[^"]*height:\s*6px[^"]*(?:linear-gradient|#3990f0|#3d97ff|#2f86f5)[^"]*"[^>]*>\s*<\/div>/gi,
    ""
  );

  const bandRe =
    /<div(\s[^>]*style="[^"]*(?:background\s*:\s*#(?:ebf3fe|ecf4ff)|background:#(?:ebf3fe|ecf4ff))[^"]*border-bottom\s*:\s*6px\s+solid\s+#(?:3990f0|2f86f5)[^"]*"[^>]*)>([\s\S]*?)<\/div>/gi;
  out = out.replace(bandRe, (_full, _attrs: string, inner: string) => wrapSalonoraBand(inner));

  const legacyBandRe =
    /<div(\s[^>]*style="[^"]*(?:background\s*:\s*#(?:ebf3fe|ecf4ff)|background:#(?:ebf3fe|ecf4ff))[^"]*border-radius:\s*(?:12|16)px[^"]*"[^>]*)>([\s\S]*?)<\/div>\s*(?=<\/div>|<!--|<hr)/gi;
  out = out.replace(legacyBandRe, (full, _attrs: string, inner: string) => {
    if (/\bsalonora-band\b/i.test(inner)) return full;
    if (!CALLOUT_LABEL_RE.test(inner)) return full;
    return wrapSalonoraBand(inner);
  });

  out = upgradePaleCalloutDivs(out);
  return out;
}

/** WP paste: pale surface box (often already `salonora-tinted`) without a footer strip. */
function upgradePaleCalloutDivs(html: string): string {
  let result = html;
  let searchFrom = 0;
  for (let pass = 0; pass < 80; pass++) {
    const re = /<div\b([^>]*)>/gi;
    re.lastIndex = searchFrom;
    const m = re.exec(result);
    if (!m) break;
    const attrs = m[1];
    if (/\bsalonora-band(?:__body|__footer)?\b/i.test(attrs)) {
      searchFrom = m.index + m[0].length;
      continue;
    }
    const styleMatch = attrs.match(/\bstyle\s*=\s*(["'])((?:\\.|(?!\1).)*)\1/i);
    if (!styleMatch) {
      searchFrom = m.index + m[0].length;
      continue;
    }
    const style = styleMatch[2];
    const isTinted = /\bsalonora-tinted\b/i.test(attrs);
    if (!isTinted && !SURFACE_BG_RE.test(style)) {
      searchFrom = m.index + m[0].length;
      continue;
    }
    const openEnd = m.index + m[0].length;
    const closeEnd = findMatchingDivCloseIndex(result, openEnd);
    if (closeEnd === -1) break;
    const inner = result.slice(openEnd, closeEnd).replace(/<\/div>\s*$/i, "");
    if (!CALLOUT_LABEL_RE.test(inner)) {
      searchFrom = closeEnd;
      continue;
    }
    const replacement = wrapSalonoraBand(inner);
    result = result.slice(0, m.index) + replacement + result.slice(closeEnd);
    searchFrom = m.index + replacement.length;
  }
  return result;
}

/** Legacy numbered rows: strip mistaken `salonora-tinted` on 28px badges; tag list wrappers. */
export function upgradeNumberedRows(html: string): string {
  if (!html) return html;
  let out = html.replace(
    /<div\s+class="salonora-tinted"(\s[^>]*style="[^"]*(?:flex:\s*0\s+0\s+28px|width:\s*28px)[^"]*"[^>]*)>/gi,
    '<div class="salonora-num-badge"$1>'
  );
  out = out.replace(
    /<div class="salonora-num-list"(\s[^>]*style="[^"]*display:\s*flex[^"]*gap:\s*(?:8|14)px[^"]*margin-bottom:\s*11px[^"]*"[^>]*)>/gi,
    '<div class="salonora-num-row"$1>'
  );
  out = out.replace(
    /<div(\s[^>]*style="[^"]*display:\s*flex[^"]*gap:\s*(?:8|14)px[^"]*margin-bottom:\s*11px[^"]*"[^>]*)>/gi,
    (full, attrs: string) => {
      if (/\bsalonora-num-row\b/i.test(attrs)) return full;
      if (/\bclass\s*=/i.test(attrs)) {
        return full.replace(/\bclass\s*=\s*(["'])([^"']*)\1/i, 'class=$1$2 salonora-num-row$1');
      }
      return `<div class="salonora-num-row"${attrs}>`;
    }
  );
  out = out.replace(
    /<div(\s[^>]*style="[^"]*flex:\s*0\s+0\s+28px[^"]*"[^>]*)>/gi,
    (full, attrs: string) => {
      if (/\bsalonora-num-badge\b/i.test(attrs)) return full;
      if (/\bclass\s*=/i.test(attrs)) {
        return full.replace(/\bclass\s*=\s*(["'])([^"']*)\1/i, 'class=$1$2 salonora-num-badge$1');
      }
      return `<div class="salonora-num-badge"${attrs}>`;
    }
  );
  out = out.replace(
    /<div(\s+style="margin:\s*18px\s+0")(\s*>)/gi,
    (full, marginStyle: string, end: string) => {
      if (/\bsalonora-num-list\b/i.test(marginStyle)) return full;
      return `<div class="salonora-num-list"${marginStyle}${end}`;
    }
  );
  return out;
}

/** Removes closed comments; truncates before any unclosed `<!--` so the rest of the article can render. */
function stripHtmlComments(html: string): string {
  let out = html;
  for (;;) {
    const start = out.indexOf("<!--");
    if (start === -1) return out;
    const end = out.indexOf("-->", start + 4);
    if (end === -1) return out.slice(0, start);
    out = out.slice(0, start) + out.slice(end + 3);
  }
}

const SALONORA_WRAPPER_CLASS_RE =
  /salonora-tip|salonora-callout|salonora-warn|salonora-checklist|salonora-inline-cta|salonora-cta-panel|salonora-tinted|salonora-band/i;

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

/** 28px brand circles in numbered lists — must not receive `salonora-tinted` card styles. */
function isLikelyNumberBadge(style: string): boolean {
  if (/\b(?:flex:\s*0\s+0\s+28px|width:\s*28px)\b/i.test(style) && /\bheight:\s*28px\b/i.test(style)) {
    return true;
  }
  if (/\bwidth:\s*28px\b/i.test(style) && /\bheight:\s*28px\b/i.test(style)) return true;
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
    if (/\bsalonora-(?:tinted|band|band__body|band__footer|num-badge)\b/i.test(attrs)) return full;
    const classMatch = attrs.match(/\bclass\s*=\s*(["'])((?:\\.|(?!\1).)*)\1/i);
    if (classMatch && SALONORA_WRAPPER_CLASS_RE.test(classMatch[2])) return full;

    const styleMatch = attrs.match(/\bstyle\s*=\s*(["'])((?:\\.|(?!\1).)*)\1/i);
    if (!styleMatch) return full;
    const style = styleMatch[2];
    if (/\bheight\s*:\s*6px\b/i.test(style)) return full;
    if (/\bborder-bottom\s*:\s*6px\s+solid\b/i.test(style)) return full;
    if (isLikelyNumberBadge(style)) return full;
    if (!styleDeclaresNonWhiteBackground(style)) return full;

    if (classMatch) {
      const q = classMatch[1];
      const classes = classMatch[2].trimEnd();
      const newAttrs = attrs.replace(classMatch[0], `class=${q}${classes} salonora-tinted${q}`);
      return `<div${newAttrs}>`;
    }
    return `<div class="salonora-tinted"${attrs}>`;
  });
}

const SAL_HEADING_ATTR_RE = /\bdata-sal-heading\s*=\s*(["'])([23])\1/i;

function nextHeadingId(inner: string, used: Set<string>): string {
  const base = slugifyHeadingFragment(inner);
  let id = base;
  let n = 2;
  while (used.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  used.add(id);
  return id;
}

/**
 * Adds stable `id` attributes to h2/h3 and inline section titles (`data-sal-heading`) for TOC anchors.
 * Handles duplicate slugs by suffixing -2, -3, …
 */
export function injectHeadingIds(html: string): string {
  if (!html) return html;
  const used = new Set<string>();
  let result = html.replace(/<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi, (full, level: string, attrs: string | undefined, inner: string) => {
    const attrStr = attrs || "";
    if (/\bid\s*=\s*["'][^"']*["']/i.test(attrStr)) {
      return full;
    }
    const id = nextHeadingId(inner, used);
    const open = `<h${level}${attrStr} id="${id}">`;
    return `${open}${inner}</h${level}>`;
  });
  result = result.replace(/<div(\s[^>]*)>([\s\S]*?)<\/div>/gi, (full, attrs: string, inner: string) => {
    if (!SAL_HEADING_ATTR_RE.test(attrs)) return full;
    if (/\bid\s*=\s*["'][^"']*["']/i.test(attrs)) return full;
    const id = nextHeadingId(inner, used);
    const spacer = attrs.endsWith(" ") ? "" : " ";
    return `<div${attrs}${spacer}id="${id}">${inner}</div>`;
  });
  return result;
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
  const salRe =
    /<div[^>]*\bdata-sal-heading\s*=\s*["']([23])["'][^>]*\bid=["']([^"']+)["'][^>]*>([\s\S]*?)<\/div>/gi;
  while ((m = salRe.exec(cleaned)) !== null) {
    const level = Number(m[1]) as 2 | 3;
    if (level !== 2 && level !== 3) continue;
    items.push({ id: m[2], label: stripTags(m[3]).trim() || m[2], level });
  }
  return items;
}

/** True for blog TOC rows: top-level sections (1., 2., …), not subsections (2.2, 1.3.4) or h3. */
export function isBlogTocMainSectionItem(item: PostTocItem): boolean {
  if (item.level === 3) return false;
  const label = item.label.trim();
  if (/^\d+(?:\.\d+)+/.test(label)) return false;
  return true;
}

const CONCLUSION_HEADING_PREFIX_RE =
  /^(?:tot\s+slot|finally|samenvattend|conclusie|in\s+conclusie)\b/i;

function normalizeConclusionHeadingLabel(label: string): string {
  return stripTags(label)
    .trim()
    .toLowerCase()
    .replace(/[.:;!?'"“”‘’]/g, "")
    .replace(/\s+/g, " ");
}

function headingMatchesBlogConclusionPanel(headingLabel: string, conclusionTitle: string): boolean {
  const heading = normalizeConclusionHeadingLabel(headingLabel);
  const title = normalizeConclusionHeadingLabel(conclusionTitle);
  if (!heading) return false;
  if (title && (heading === title || heading.includes(title) || title.includes(heading))) {
    return true;
  }
  const headingPrefix = heading.split(/\s+/).slice(0, 5).join(" ");
  const titlePrefix = title.split(/\s+/).slice(0, 5).join(" ");
  if (title && headingPrefix === titlePrefix) return true;
  return CONCLUSION_HEADING_PREFIX_RE.test(heading);
}

type PostHeadingBlock = { index: number; label: string };

function collectPostH2Blocks(html: string): PostHeadingBlock[] {
  const blocks: PostHeadingBlock[] = [];
  const h2Re = /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi;
  let m: RegExpExecArray | null;
  while ((m = h2Re.exec(html)) !== null) {
    blocks.push({ index: m.index, label: stripTags(m[1]) });
  }
  const salRe = /<div[^>]*\bdata-sal-heading\s*=\s*["']2["'][^>]*>([\s\S]*?)<\/div>/gi;
  while ((m = salRe.exec(html)) !== null) {
    blocks.push({ index: m.index, label: stripTags(m[1]) });
  }
  return blocks.sort((a, b) => a.index - b.index);
}

function trimPrecedingPostSeparators(html: string, cutIndex: number): number {
  let out = html.slice(0, cutIndex).trimEnd();
  const trailingRe =
    /(?:\s*<hr\b[^>]*>|\s*<!--\s*wp:separator[\s\S]*?-->|\s*<p>\s*<\/p>)+\s*$/i;
  for (let pass = 0; pass < 8; pass++) {
    const next = out.replace(trailingRe, "");
    if (next === out) break;
    out = next.trimEnd();
  }
  return out.length;
}

/**
 * When `blog_conclusion_panel` renders below FAQ, drop the duplicate closing
 * chapter from post HTML (n8n/Gutenberg often still paste it into `content`).
 */
export function stripBlogBodyConclusionDuplicate(html: string, conclusionTitle: string): string {
  if (!html.trim()) return html;
  const blocks = collectPostH2Blocks(html);
  if (!blocks.length) return html;

  let matchIndex = -1;
  for (let i = blocks.length - 1; i >= 0; i--) {
    if (headingMatchesBlogConclusionPanel(blocks[i].label, conclusionTitle)) {
      matchIndex = blocks[i].index;
      break;
    }
  }
  if (matchIndex < 0) return html;

  const cutAt = trimPrecedingPostSeparators(html, matchIndex);
  return html.slice(0, cutAt).trimEnd();
}

/** Blog single TOC — only main chapter headings; subsections stay in the article. */
export function filterBlogPostTocItems(items: PostTocItem[]): PostTocItem[] {
  return items.filter(isBlogTocMainSectionItem);
}

function tocAlreadyHasLabel(items: PostTocItem[], title: string): boolean {
  const norm = title.trim().toLowerCase();
  return items.some((i) => i.label.trim().toLowerCase() === norm);
}

/**
 * Blog sidebar TOC: main `h2` chapters from post HTML, plus the shared
 * `blog_conclusion_panel` title when configured (not FAQ — template-only).
 */
export function buildBlogPostToc(content: string, layoutSections: AnySectionT[]): PostTocItem[] {
  const items = filterBlogPostTocItems(extractPostToc(content));
  const panel = layoutSections.find((s) => s.type === "blog_conclusion_panel");
  if (!panel || panel.type !== "blog_conclusion_panel") return items;
  const title = panel.title.trim();
  if (!title || tocAlreadyHasLabel(items, title)) return items;
  return [...items, { id: "post-conclusion", label: title, level: 2 }];
}
