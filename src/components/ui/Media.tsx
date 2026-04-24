import Image from "next/image";
import { getImageAlt, getImageUrl, getLargestImageUrl } from "@/lib/utils/media";
import type { WpImage } from "@/types/wordpress";

type Props = {
  image: WpImage | null;
  className?: string;
  fill?: boolean;
  sizes?: string;
  /** Default 75; use 90+ for small UI graphics that look soft on retina. */
  quality?: number;
  /**
   * Use the largest `sizes` URL from WordPress (e.g. `full`) instead of the
   * default `url` (often a small medium/thumbnail) — avoids a blurry up‑scale.
   */
  preferLargestSource?: boolean;
  priority?: boolean;
  width?: number;
  height?: number;
};

export function Media({
  image,
  className = "",
  fill,
  sizes,
  quality,
  preferLargestSource = false,
  priority,
  width = 800,
  height = 600,
}: Props) {
  const src = preferLargestSource ? (getLargestImageUrl(image) || getImageUrl(image)) : getImageUrl(image);
  if (!src) return null;
  const alt = getImageAlt(image);
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover ${className}`}
        sizes={sizes}
        priority={priority}
        quality={quality}
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      priority={priority}
      quality={quality}
    />
  );
}
