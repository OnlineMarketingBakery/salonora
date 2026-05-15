import type { ReactNode } from "react";
import { Media } from "@/components/ui/Media";
import { getImageUrl, getLargestImageUrl } from "@/lib/utils/media";
import type { WpImage } from "@/types/wordpress";

type Props = {
  className?: string;
  children?: ReactNode;
  borderClassName?: string;
  variant?: "on-dark" | "on-brand" | "on-light";
  /** When set with a resolvable URL and `variant === "on-brand"`, replaces the static `/button-icon-primary.svg` asset. */
  brandImage?: WpImage | null;
};

const ICON_BY_VARIANT: Record<NonNullable<Props["variant"]>, string> = {
  "on-brand": "/button-icon-primary.svg",
  "on-light": "/button-icon-dark.svg",
  "on-dark": "/button-icon-light.svg",
};

export function ArrowInCircle({
  className = "",
  children,
  borderClassName,
  variant = "on-dark",
  brandImage,
}: Props) {
  if (children) {
    const ring =
      borderClassName ||
      (variant === "on-brand"
        ? "border border-white/25"
        : variant === "on-light"
          ? "border border-brand/30"
          : "border border-white/80");
    return (
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${ring} ${className}`}
        aria-hidden
      >
        {children}
      </span>
    );
  }

  if (variant === "on-brand" && brandImage != null) {
    const src = getLargestImageUrl(brandImage) || getImageUrl(brandImage);
    if (src) {
      return (
        <span
          className={`inline-flex h-5 w-5 shrink-0 items-center justify-center ${className}`.trim()}
          aria-hidden
        >
          <Media
            image={brandImage}
            width={40}
            height={40}
            className="block h-full w-full min-h-0 min-w-0 object-contain"
            sizes="20px"
            preferLargestSource
          />
        </span>
      );
    }
  }

  return (
    <span
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center ${className}`.trim()}
      aria-hidden
    >
      <img
        src={ICON_BY_VARIANT[variant]}
        width={20}
        height={20}
        alt=""
        className="block h-full w-full min-h-0 min-w-0 object-contain"
        role="presentation"
        decoding="async"
      />
    </span>
  );
}
