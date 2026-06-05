import { wpFetch } from "./client";
import { getCptRestBase } from "./config";
import type { WpTestimonialRaw } from "@/types/wordpress";
import type { TestimonialDocument } from "@/types/testimonials";
import { asImage, asString, asHtml } from "@/lib/acf/field-mappers";
import type { Locale } from "@/lib/i18n/locales";
import { logger } from "@/lib/utils/logger";

type WpMediaRaw = { source_url?: string };

function parseRating(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  const n = typeof raw === "number" ? raw : Number(String(raw).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

async function fetchMediaSourceUrl(id: number, lang: Locale): Promise<string | null> {
  try {
    const m = await wpFetch<WpMediaRaw>(`/wp/v2/media/${id}`, { lang, revalidate: 3600 });
    return m.source_url?.trim() || null;
  } catch {
    return null;
  }
}

function toDoc(raw: WpTestimonialRaw, mediaUrlById: Map<number, string>): TestimonialDocument {
  const a = raw.acf || {};
  let avatar = asImage(a.avatar);
  if (!avatar && typeof a.avatar === "number" && a.avatar > 0) {
    const u = mediaUrlById.get(a.avatar);
    if (u) avatar = { url: u, alt: asString(a.client_name) };
  }
  return {
    id: raw.id,
    clientName: asString(a.client_name),
    clientRole: asString(a.client_role),
    clientTestimonial: asHtml(a.client_testimonial),
    rating: parseRating(a.rating),
    avatar,
  };
}

function isEmptyShell(doc: TestimonialDocument): boolean {
  return !doc.clientName.trim() && !doc.clientTestimonial.trim();
}

async function rowsToDocs(rows: WpTestimonialRaw[], lang: Locale): Promise<TestimonialDocument[]> {
  const numericAvatarIds = new Set<number>();
  for (const r of rows) {
    const av = r.acf?.avatar;
    if (typeof av === "number" && av > 0) numericAvatarIds.add(av);
  }
  const mediaUrlById = new Map<number, string>();
  await Promise.all(
    [...numericAvatarIds].map(async (id) => {
      const u = await fetchMediaSourceUrl(id, lang);
      if (u) mediaUrlById.set(id, u);
    })
  );
  return rows.map((r) => toDoc(r, mediaUrlById));
}

export async function fetchTestimonialsByIds(
  ids: number[],
  lang: Locale
): Promise<TestimonialDocument[]> {
  if (!ids.length) return [];
  const rest = getCptRestBase("testimonial");
  const include = ids.map(String).join(",");
  const path = `/wp/v2/${rest}?per_page=100&include=${include}&acf_format=standard`;
  try {
    let rows = await wpFetch<WpTestimonialRaw[]>(path, { lang, revalidate: 60 });
    if (!Array.isArray(rows)) return [];

    let docs = await rowsToDocs(rows, lang);
    const byId = new Map(docs.map((d) => [d.id, d]));
    let ordered = ids.map((id) => byId.get(id)).filter((x): x is TestimonialDocument => x != null);

    // Retry without ISR cache when WordPress briefly returned empty ACF (e.g. after field-group sync).
    if (ordered.length > 0 && ordered.every(isEmptyShell)) {
      rows = await wpFetch<WpTestimonialRaw[]>(path, { lang, revalidate: false });
      if (Array.isArray(rows) && rows.length) {
        docs = await rowsToDocs(rows, lang);
        const retryById = new Map(docs.map((d) => [d.id, d]));
        ordered = ids.map((id) => retryById.get(id)).filter((x): x is TestimonialDocument => x != null);
      }
    }

    return ordered;
  } catch (e) {
    logger.warn("fetchTestimonialsByIds", e);
    return [];
  }
}
