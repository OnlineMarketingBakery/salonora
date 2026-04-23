import type { WpImage } from "@/types/wordpress";

export function getImageUrl(image: WpImage | null | undefined): string | null {
  if (!image) return null;
  if (typeof image === "string") return image;
  return image.url || null;
}

export function getImageAlt(image: WpImage | null | undefined): string {
  if (!image) return "";
  if (typeof image === "string") return "";
  return image.alt || image.title || "";
}
