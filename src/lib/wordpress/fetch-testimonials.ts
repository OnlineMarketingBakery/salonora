import { wpFetch } from "./client";
import { getCptRestBase } from "./config";
import type { WpTestimonialRaw } from "@/types/wordpress";
import type { TestimonialDocument } from "@/types/testimonials";
import { asImage, asString, asHtml } from "@/lib/acf/field-mappers";
import type { Locale } from "@/lib/i18n/locales";
import { logger } from "@/lib/utils/logger";

function toDoc(raw: WpTestimonialRaw): TestimonialDocument {
  const a = raw.acf || {};
  return {
    id: raw.id,
    clientName: asString(a.client_name),
    clientRole: asString(a.client_role),
    clientTestimonial: asHtml(a.client_testimonial),
    rating: typeof a.rating === "number" ? a.rating : a.rating ? Number(a.rating) : null,
    avatar: asImage(a.avatar),
  };
}

export async function fetchTestimonialsByIds(
  ids: number[],
  lang: Locale
): Promise<TestimonialDocument[]> {
  if (!ids.length) return [];
  const rest = getCptRestBase("testimonial");
  const include = ids.map(String).join(",");
  try {
    const rows = await wpFetch<WpTestimonialRaw[]>(
      `/wp/v2/${rest}?per_page=100&include=${include}`,
      { lang, revalidate: 60 }
    );
    if (!Array.isArray(rows)) return [];
    return rows.map(toDoc);
  } catch (e) {
    logger.warn("fetchTestimonialsByIds", e);
    return [];
  }
}
