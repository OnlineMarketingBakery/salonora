import type { WpAcfLink, WpImage } from "@/types/wordpress";
import type { CtaItem } from "@/types/sections";

export function mapCtaRepeater(
  rows: Array<{ cta_text?: string; cta_url?: WpAcfLink }> | null | undefined
): CtaItem[] {
  if (!rows?.length) return [];
  return rows
    .map((r) => ({
      text: r.cta_text || "",
      url: r.cta_url || null,
    }))
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

export function asLink(v: unknown): WpAcfLink | null {
  if (!v || typeof v !== "object") return null;
  const o = v as WpAcfLink;
  return o.url ? o : null;
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
