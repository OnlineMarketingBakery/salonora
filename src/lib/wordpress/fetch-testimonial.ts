import { wpFetch } from "./client";
import { getCptRestBase } from "./config";
import type { WpTestimonialRaw } from "@/types/wordpress";
import type { Locale } from "@/lib/i18n/locales";

export async function fetchTestimonialById(id: number, lang: Locale): Promise<WpTestimonialRaw | null> {
  const rest = getCptRestBase("testimonial");
  try {
    return await wpFetch<WpTestimonialRaw>(`/wp/v2/${rest}/${id}?_embed=1`, { lang, revalidate: 60 });
  } catch {
    return null;
  }
}
