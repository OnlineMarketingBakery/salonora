import type { MetadataRoute } from "next";
import { fetchSitemapEntries } from "@/lib/wordpress/fetch-sitemap-entries";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await fetchSitemapEntries();
  return entries.map((e) => ({
    url: e.url,
    lastModified: e.lastModified,
  }));
}
