import type { WpAcfLink, WpImage } from "@/types/wordpress";
import type { CtaItem } from "@/types/sections";

export function mapCtaRepeater(
  rows: Array<{ cta_text?: unknown; cta_url?: unknown }> | null | undefined
): CtaItem[] {
  if (!rows?.length) return [];
  return rows
    .map((r) => {
      const url = asLink(r.cta_url);
      const text = asString(r.cta_text) || url?.title || "";
      return { text, url };
    })
    .filter((r) => r.text || r.url);
}

export function asString(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  return String(v);
}

export function asBool(v: unknown): boolean {
  if (v === true || v === 1 || v === "1") return true;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "yes" || s === "true" || s === "on";
  }
  return false;
}

export function asImage(v: unknown): WpImage | null {
  if (v == null) return null;
  if (typeof v === "string") {
    const u = v.trim();
    if ((u.startsWith("http://") || u.startsWith("https://") || u.startsWith("//")) && u.length > 8) {
      return { url: u.startsWith("//") ? `https:${u}` : u, alt: "" };
    }
    if (/^\d+$/.test(u)) {
      return { url: "", id: parseInt(u, 10), alt: "" };
    }
    return null;
  }
  if (typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const sizes = o.sizes;
  const isUsableHref = (u: string): boolean =>
    u.length > 0 && (u.startsWith("http://") || u.startsWith("https://") || u.startsWith("//") || u.startsWith("/"));

  const urlFromSizes = (): string | null => {
    if (!sizes || typeof sizes !== "object") return null;
    const s = sizes as Record<string, unknown>;
    for (const key of ["full", "2048x2048", "1536x1536", "large", "medium_large", "medium", "thumbnail"] as const) {
      const entry = s[key];
      if (typeof entry === "string") {
        const t = entry.trim();
        if (isUsableHref(t)) return t;
      }
      if (entry && typeof entry === "object" && typeof (entry as { url?: unknown }).url === "string") {
        const u = (entry as { url: string }).url.trim();
        if (isUsableHref(u)) return u;
      }
    }
    return null;
  };
  const guid = o.guid;
  const guidRendered =
    guid && typeof guid === "object" && typeof (guid as { rendered?: unknown }).rendered === "string"
      ? String((guid as { rendered: string }).rendered).trim()
      : "";
  const rawUrl =
    typeof o.url === "string"
      ? o.url
      : typeof o.source_url === "string"
        ? o.source_url
        : guidRendered.startsWith("http") || guidRendered.startsWith("/")
          ? guidRendered
          : null;
  let urlCandidate: string | null =
    typeof rawUrl === "string" && rawUrl.length > 0 && rawUrl !== "false" ? rawUrl.trim() : urlFromSizes();
  if (!urlCandidate && typeof o.preview === "string" && isUsableHref(o.preview.trim())) {
    urlCandidate = o.preview.trim();
  }
  const idOnly =
    typeof o.id === "number" && o.id > 0
      ? Math.floor(o.id)
      : typeof o.ID === "number" && o.ID > 0
        ? Math.floor(o.ID)
        : typeof o.id === "string" && /^\d+$/.test(o.id.trim())
          ? parseInt(o.id.trim(), 10)
          : typeof o.ID === "string" && /^\d+$/.test(o.ID.trim())
            ? parseInt(o.ID.trim(), 10)
            : null;
  if ((!urlCandidate || typeof urlCandidate !== "string") && idOnly) {
    return { url: "", id: idOnly, alt: "" };
  }
  if (!urlCandidate || typeof urlCandidate !== "string") return null;
  const alt =
    typeof o.alt === "string"
      ? o.alt
      : typeof o.alt_text === "string"
        ? o.alt_text
        : typeof o.caption === "string"
          ? o.caption
          : "";
  const id = typeof o.id === "number" ? o.id : typeof o.ID === "number" ? o.ID : undefined;
  return {
    url: urlCandidate,
    alt,
    id,
    title: typeof o.title === "string" ? o.title : typeof o.filename === "string" ? o.filename : undefined,
    width: typeof o.width === "number" ? o.width : undefined,
    height: typeof o.height === "number" ? o.height : undefined,
    sizes: sizes && typeof sizes === "object" ? (sizes as WpImage["sizes"]) : undefined,
  };
}

/**
 * ACF/REST link fields are usually `{ title, url, target }` but we also see
 * root URL strings, `href`/`URL` keys, or a bare permalink string after import.
 */
export function asLink(v: unknown): WpAcfLink | null {
  if (v == null) return null;
  if (typeof v === "string") {
    const url = v.trim();
    if (!url) return null;
    return { title: "", url, target: undefined };
  }
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    const urlRaw = o.url ?? o.URL ?? o.href;
    if (typeof urlRaw === "string" && urlRaw.trim()) {
      return {
        title: typeof o.title === "string" ? o.title : undefined,
        url: urlRaw.trim(),
        target: typeof o.target === "string" ? o.target : undefined,
      };
    }
  }
  return null;
}

export function asHtml(v: unknown): string {
  return asString(v);
}

export function newSectionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `s-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * ACF relationship fields in REST may be post IDs, numeric strings, or post-shaped objects
 * (`id`, `ID`, or embedded `rest_base` objects). We only need stable post IDs for follow-up fetches.
 */
export function asRelationshipPostIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  const out: number[] = [];
  for (const entry of value) {
    if (typeof entry === "number" && Number.isFinite(entry)) {
      out.push(entry);
      continue;
    }
    if (typeof entry === "string" && /^\d+$/.test(entry.trim())) {
      out.push(Number(entry.trim()));
      continue;
    }
    if (entry && typeof entry === "object") {
      const o = entry as Record<string, unknown>;
      const raw = o.id ?? o.ID;
      if (typeof raw === "number" && Number.isFinite(raw)) {
        out.push(raw);
        continue;
      }
      if (typeof raw === "string" && /^\d+$/.test(raw.trim())) {
        out.push(Number(raw.trim()));
      }
    }
  }
  return out;
}
