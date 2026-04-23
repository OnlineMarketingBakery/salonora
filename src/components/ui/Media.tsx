import Image from "next/image";
import { getImageAlt, getImageUrl } from "@/lib/utils/media";
import type { WpImage } from "@/types/wordpress";

type Props = {
  image: WpImage | null;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
};

export function Media({ image, className = "", fill, sizes, priority, width = 800, height = 600 }: Props) {
  const src = getImageUrl(image);
  if (!src) return null;
  const alt = getImageAlt(image);
  if (fill) {
    return <Image src={src} alt={alt} fill className={`object-cover ${className}`} sizes={sizes} priority={priority} />;
  }
  return <Image src={src} alt={alt} width={width} height={height} className={className} priority={priority} />;
}
