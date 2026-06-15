import { ArrowInCircle } from "@/components/ui/ArrowInCircle";
import { Media } from "@/components/ui/Media";
import { CTA_ARROW_CLASS, CTA_CARD_ARROW_CLASS } from "@/lib/ui/cta-tokens";
import type { WpImage } from "@/types/wordpress";

type Props = {
  image: WpImage | null;
  /** Defaults to standard 20px CTA arrow slot. */
  sizeClass?: string;
  imageClassName?: string;
};

/**
 * CMS trailing icon for brand CTAs — always rendered through `ArrowInCircle` so it
 * matches the default circled-arrow treatment sitewide.
 */
export function CtaTrailingIcon({
  image,
  sizeClass = CTA_ARROW_CLASS,
  imageClassName,
}: Props) {
  if (!image) return null;

  if (imageClassName) {
    return (
      <ArrowInCircle variant="on-brand" className={sizeClass}>
        <Media
          image={image}
          width={40}
          height={40}
          className={`size-[14px] object-contain ${imageClassName}`.trim()}
          sizes="20px"
          preferLargestSource
        />
      </ArrowInCircle>
    );
  }

  return (
    <ArrowInCircle variant="on-brand" className={sizeClass} brandImage={image} />
  );
}

export { CTA_CARD_ARROW_CLASS };
