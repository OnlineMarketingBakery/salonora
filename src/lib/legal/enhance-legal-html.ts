const INTERNAL_HOST_RE = /(^|\.)salonora\.eu$/i;

function isExternalHref(href: string): boolean {
  const h = href.trim();
  if (!h || h.startsWith("#") || h.startsWith("mailto:") || h.startsWith("tel:")) return false;
  if (h.startsWith("/")) return false;
  try {
    const u = new URL(h);
    if (!["http:", "https:"].includes(u.protocol)) return false;
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return false;
    return !INTERNAL_HOST_RE.test(u.hostname);
  } catch {
    return false;
  }
}

function mergeAnchorClass(existing: string, extra: string): string {
  const classes = new Set(
    `${existing} ${extra}`
      .split(/\s+/)
      .map((c) => c.trim())
      .filter(Boolean)
  );
  return Array.from(classes).join(" ");
}

/** Brand link classes, external targets, and icon hook class on legal anchors. */
export function enhanceLegalLinks(html: string): string {
  return html.replace(/<a\s+([^>]*)>/gi, (match, attrs: string) => {
    const hrefMatch = attrs.match(/href=["']([^"']+)["']/i);
    if (!hrefMatch) return match;
    const href = hrefMatch[1];
    const external = isExternalHref(href);
    const classMatch = attrs.match(/class=["']([^"']*)["']/i);
    const linkClass = mergeAnchorClass(
      classMatch?.[1] ?? "",
      external ? "legal-link legal-link--external" : "legal-link"
    );
    let next = attrs;
    if (classMatch) {
      next = next.replace(/class=["'][^"']*["']/i, `class="${linkClass}"`);
    } else {
      next = `class="${linkClass}" ${next}`;
    }
    if (external && !/target=/i.test(next)) {
      next += ' target="_blank" rel="noopener noreferrer"';
    }
    return `<a ${next}>`;
  });
}

/** Wrap each h2 block in a section for alternating bands; one counter scope for all headings. */
export function wrapLegalBodySections(bodyHtml: string): string {
  if (!bodyHtml.trim()) return "";

  if (!/<h2\b/i.test(bodyHtml)) {
    return `<div class="legal-prose-document legal-prose-numbered"><div class="legal-prose-body">${bodyHtml}</div></div>`;
  }

  const chunks = bodyHtml.split(/(?=<h2\b)/i).filter((c) => c.trim());
  let sectionIndex = 0;
  const inner = chunks
    .map((chunk) => {
      if (!/^<h2\b/i.test(chunk.trim())) {
        return `<div class="legal-prose-preamble"><div class="legal-prose-body">${chunk}</div></div>`;
      }
      const band = sectionIndex % 2 === 1 ? " legal-prose-section--band" : "";
      sectionIndex += 1;
      return `<section class="legal-prose-section${band}"><div class="legal-prose-body">${chunk}</div></section>`;
    })
    .join("");

  return `<div class="legal-prose-document legal-prose-numbered">${inner}</div>`;
}
