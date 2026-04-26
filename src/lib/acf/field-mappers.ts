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
  if (!v || typeof v !== "object") return null;
  const o = v as WpImage;
  return o.url ? o : null;
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
