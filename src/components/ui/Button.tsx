"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowInCircle } from "@/components/ui/ArrowInCircle";
import { registerGsapClient } from "@/lib/gsap/register";

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
  ctaBrand: "bg-brand text-white hover:bg-accent",
  ctaWhite: "bg-white text-navy hover:bg-surface",
  ctaNavy: "bg-navy text-white hover:bg-navy-deep",
  ctaNavyDeep: "bg-navy-deep text-white hover:bg-navy",
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
  /** Replace default circled-arrow image (brand CTAs, etc.). Hover animation still targets `[data-cta-arrow]`. */
  arrowContent?: ReactNode;
};

const standardBase =
  "inline-flex items-center justify-center rounded-full px-6 py-3 transition-all duration-400 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand";

const ctaLabelClass =
  "min-w-0 break-words text-balance sm:whitespace-nowrap [text-align:left]";

const ctaBaseShared =
  "group inline-flex shrink-0 items-center font-sans font-normal transition-all duration-400 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand";

function plainTextLabel(children: ReactNode): string | null {
  if (typeof children === "string" || typeof children === "number") {
    const s = String(children);
    return s.length > 0 ? s : null;
  }
  return null;
}

function CtaLabel({ children }: { children: ReactNode }) {
  const plain = plainTextLabel(children);
  if (plain) {
    return (
      <span className={ctaLabelClass} aria-hidden="true" data-cta-label>
        {Array.from(plain).map((ch, i) => (
          <span key={i} data-cta-char className="inline-block will-change-[transform,opacity]">
            {ch === " " ? "\u00a0" : ch}
          </span>
        ))}
      </span>
    );
  }
  return (
    <span className={ctaLabelClass} data-cta-label>
      {children}
    </span>
  );
}

const ctaWidthFull = "w-full min-w-0 max-w-full";
const ctaWidthInline = "w-auto max-w-full min-w-0";

function useButtonHover(
  rootRef: React.RefObject<HTMLElement | null>,
  opts: { disabled?: boolean; hasArrow: boolean; enabled: boolean },
) {
  useGSAP(
    (ctx, contextSafe) => {
      registerGsapClient();
      const root = rootRef.current;
      if (!root || opts.disabled || !opts.enabled) return;
      if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const safe = contextSafe ?? ((fn: () => void) => fn);
      const arrow = opts.hasArrow ? root.querySelector<HTMLElement>("[data-cta-arrow]") : null;
      if (arrow) gsap.set(arrow, { transformOrigin: "50% 50%" });

      const targetsForKill = () => {
        const label = root.querySelector<HTMLElement>("[data-cta-label]");
        const chars = label ? Array.from(label.querySelectorAll<HTMLElement>("[data-cta-char]")) : [];
        return [label, arrow, ...chars].filter((el): el is HTMLElement => Boolean(el));
      };

      const onEnter = safe(() => {
        gsap.killTweensOf(targetsForKill());
        const label = root.querySelector<HTMLElement>("[data-cta-label]");
        const chars = label ? Array.from(label.querySelectorAll<HTMLElement>("[data-cta-char]")) : [];

        if (chars.length > 0) {
          gsap.fromTo(
            chars,
            { y: "0.2em", opacity: 0.45 },
            {
              y: 0,
              opacity: 1,
              duration: 0.42,
              ease: "power3.out",
              stagger: { each: 0.024, from: "start" },
            },
          );
        } else if (label) {
          gsap.fromTo(
            label,
            { y: 6, opacity: 0.88 },
            { y: 0, opacity: 1, duration: 0.36, ease: "power2.out" },
          );
        }

        if (arrow) {
          gsap.fromTo(
            arrow,
            { x: 0, y: 0, rotation: 0, scale: 1 },
            {
              x: 7,
              y: -2,
              rotation: 9,
              scale: 1.06,
              duration: 0.45,
              ease: "power2.out",
            },
          );
        }
      });

      const onLeave = safe(() => {
        gsap.killTweensOf(targetsForKill());
        const label = root.querySelector<HTMLElement>("[data-cta-label]");
        const chars = label ? Array.from(label.querySelectorAll<HTMLElement>("[data-cta-char]")) : [];

        if (chars.length > 0) {
          gsap.to(chars, {
            y: 0,
            opacity: 1,
            duration: 0.26,
            ease: "power2.inOut",
            stagger: { each: 0.016, from: "end" },
          });
        } else if (label) {
          gsap.to(label, { y: 0, opacity: 1, duration: 0.28, ease: "power2.out" });
        }

        if (arrow) {
          gsap.to(arrow, {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            duration: 0.44,
            ease: "power3.out",
          });
        }
      });

      root.addEventListener("pointerenter", onEnter);
      root.addEventListener("pointerleave", onLeave);
      return () => {
        root.removeEventListener("pointerenter", onEnter);
        root.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: rootRef, dependencies: [opts.disabled, opts.hasArrow, opts.enabled] },
  );
}

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
  arrowContent,
}: Props) {
  const rootRef = useRef<HTMLElement | null>(null);
  const dis = disabled ? "pointer-events-none opacity-60" : "";
  const isCta = isCtaVariant(variant);
  const useArrow = isCta && (showArrow ?? true);

  useButtonHover(rootRef, { disabled, hasArrow: Boolean(useArrow), enabled: isCta });

  if (isCta) {
    const justify = ctaJustify === "between" ? "justify-between" : "justify-center";
    const shadow = ctaShadowClass(variant, ctaElevation);
    const sizeCls = ctaSizeClass[ctaSize];
    const ctaWidth = ctaFullWidth ? ctaWidthFull : ctaWidthInline;
    const cls =
      `${ctaBaseShared} ${ctaWidth} ${justify} ${sizeCls} ${ctaSurface[variant]} ${shadow} ${dis} ${className}`.trim();

    const ctaName = plainTextLabel(children);
    const inner = (
      <>
        <CtaLabel>{children}</CtaLabel>
        {useArrow ? (
          <span data-cta-arrow className="inline-flex shrink-0 will-change-[transform]">
            {arrowContent ?? (
              <ArrowInCircle variant={ctaArrowVariant[variant]} className={arrowClassName ?? "h-5 w-5 shrink-0"} />
            )}
          </span>
        ) : null}
      </>
    );
    const a11yName = ctaName ? { "aria-label": ctaName } : {};
    if (href) {
      return (
        <Link
          ref={rootRef as React.Ref<HTMLAnchorElement>}
          href={href}
          className={cls}
          target={target}
          rel={target === "_blank" ? "noopener noreferrer" : undefined}
          onClick={onClick}
          {...a11yName}
        >
          {inner}
        </Link>
      );
    }
    return (
      <button
        ref={rootRef as React.Ref<HTMLButtonElement>}
        type={type}
        className={cls}
        onClick={onClick}
        disabled={disabled}
        {...a11yName}
      >
        {inner}
      </button>
    );
  }

  const cls = `${standardBase} ${standardVariants[variant]} ${dis} ${className}`;

  if (href) {
    return (
      <Link
        ref={rootRef as React.Ref<HTMLAnchorElement>}
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
    <button ref={rootRef as React.Ref<HTMLButtonElement>} type={type} className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
