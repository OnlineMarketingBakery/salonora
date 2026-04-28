import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowInCircle } from "@/components/ui/ArrowInCircle";

const textBody = "text-base font-normal font-sans leading-normal";
const textWhite = "text-white";

const standardVariants = {
  primary: `bg-brand ${textWhite} hover:brightness-95 shadow-md shadow-navy-deep/10 ${textBody}`,
  secondary: `bg-white text-brand border-2 border-brand hover:bg-surface ${textBody}`,
  ghost: `bg-transparent border-2 border-white/80 text-white hover:bg-white/10 ${textBody}`,
  dark: `bg-navy-deep ${textWhite} hover:bg-navy ${textBody}`,
  white: `bg-white text-foreground hover:bg-surface ${textBody}`,
  elevated: `bg-white text-navy shadow-[0px_6px_20px_0px_rgba(57,144,240,0.54)] border-0 hover:brightness-[0.99] ${textBody}`,
} as const;

const ctaSurface = {
  ctaBrand: "bg-brand text-white hover:brightness-105",
  ctaWhite: "bg-white text-navy hover:brightness-[0.99]",
  ctaNavy: "bg-navy text-white hover:brightness-110",
  ctaNavyDeep: "bg-navy-deep text-white hover:bg-navy-deep/95",
} as const;

const ctaArrowVariant = {
  ctaBrand: "on-brand" as const,
  ctaWhite: "on-light" as const,
  ctaNavy: "on-dark" as const,
  ctaNavyDeep: "on-dark" as const,
};

export type ButtonVariant = keyof typeof standardVariants | keyof typeof ctaSurface;

function isCtaVariant(v: ButtonVariant): v is keyof typeof ctaSurface {
  return v in ctaSurface;
}

const ctaSizeClass = {
  default: "h-12 min-h-12 rounded-[24px] gap-[17px] px-3.5 text-base leading-normal",
  hero: "h-12 min-h-12 rounded-[24px] gap-[17px] px-3.5 text-lg leading-6",
  promo: "h-[54px] min-h-[54px] rounded-[27px] gap-2 px-3 text-lg leading-6 sm:gap-8",
  compact: "h-12 min-h-12 rounded-[24px] gap-2 px-3.5 sm:px-4 text-[16px] tracking-[-0.04em]",
  card: "h-[42px] min-h-[42px] rounded-[24px] gap-0 pl-[18px] pr-3.5 text-sm leading-6 tracking-normal",
  package: "h-[55px] min-h-[55px] rounded-[31.5px] gap-2 px-4 text-base leading-normal",
  drawer: "h-12 min-h-12 rounded-full gap-2.5 px-4 text-[16px] tracking-[-0.04em]",
} as const;

export type ButtonCtaSize = keyof typeof ctaSizeClass;

type CtaElevation = "default" | "none" | "footerSecondary";

function ctaShadowClass(variant: keyof typeof ctaSurface, elevation: CtaElevation): string {
  if (elevation === "none") return "";
  if (elevation === "footerSecondary" && variant === "ctaWhite") {
    return "shadow-[0px_6px_10px_rgba(57,144,240,0.54)]";
  }
  if (variant === "ctaBrand" || variant === "ctaWhite") {
    return "shadow-[0px_6px_20px_0px_rgba(57,144,240,0.54)]";
  }
  if (variant === "ctaNavy") return "shadow-sm";
  return "";
}

type Props = {
  href?: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  target?: string;
  disabled?: boolean;
  /** Layout for CTA pills: between (footer, package rows) vs center (default). */
  ctaJustify?: "center" | "between";
  ctaSize?: ButtonCtaSize;
  ctaElevation?: CtaElevation;
  /** Full-width CTAs in stacked layouts; set false for inline slots (e.g. header). */
  ctaFullWidth?: boolean;
  showArrow?: boolean;
  arrowClassName?: string;
};

const standardBase =
  "inline-flex items-center justify-center rounded-full px-6 py-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand";

const ctaBaseShared =
  "group inline-flex shrink-0 items-center font-sans font-normal transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand";

const ctaWidthFull = "w-full min-w-0 max-w-full";
const ctaWidthInline = "w-auto max-w-none min-w-0";

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
  type = "button",
  onClick,
  target,
  disabled,
  ctaJustify = "between",
  ctaSize = "default",
  ctaElevation = "default",
  ctaFullWidth = true,
  showArrow,
  arrowClassName,
}: Props) {
  const dis = disabled ? "pointer-events-none opacity-60" : "";
  const useArrow = isCtaVariant(variant) && (showArrow ?? true);

  if (isCtaVariant(variant)) {
    const justify = ctaJustify === "between" ? "justify-between" : "justify-center";
    const shadow = ctaShadowClass(variant, ctaElevation);
    const sizeCls = ctaSizeClass[ctaSize];
    const ctaWidth = ctaFullWidth ? ctaWidthFull : ctaWidthInline;
    const cls =
      `${ctaBaseShared} ${ctaWidth} ${justify} ${sizeCls} ${ctaSurface[variant]} ${shadow} ${dis} ${className}`.trim();
    const inner = useArrow ? (
      <>
        <span className="min-w-0 break-words text-balance sm:whitespace-nowrap [text-align:left]">{children}</span>
        <ArrowInCircle variant={ctaArrowVariant[variant]} className={arrowClassName ?? "h-5 w-5 shrink-0"} />
      </>
    ) : (
      children
    );
    if (href) {
      return (
        <Link
          href={href}
          className={cls}
          target={target}
          rel={target === "_blank" ? "noopener noreferrer" : undefined}
          onClick={onClick}
        >
          {inner}
        </Link>
      );
    }
    return (
      <button type={type} className={cls} onClick={onClick} disabled={disabled}>
        {inner}
      </button>
    );
  }

  const cls = `${standardBase} ${standardVariants[variant]} ${dis} ${className}`;
  if (href) {
    return (
      <Link
        href={href}
        className={cls}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
