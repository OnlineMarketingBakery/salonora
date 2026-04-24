import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowInCircle } from "@/components/ui/ArrowInCircle";

const primaryCtaBase =
  "group inline-flex h-12 max-w-full min-w-0 items-center justify-center gap-[17px] rounded-[24px] bg-brand px-3.5 font-medium text-white font-sans shadow-[0px_6px_20px_0px_rgba(57,144,240,0.54)] transition hover:brightness-105";

/** Default: 16px / medium / line-height normal / white (Fustat from page). */
const primaryCtaSizeDefault = "text-base leading-normal";
/** Hero only: 18px, line 24px. */
const primaryCtaSizeHero = "text-lg leading-6";

/** @deprecated Prefer PrimaryCtaLink; kept for any external imports. */
export const primaryCtaClassName = `${primaryCtaBase} ${primaryCtaSizeDefault}`;

type Props = {
  href: string;
  children: ReactNode;
  target?: string;
  className?: string;
  /** `hero` = 18px / 24px; default = 16px / normal (per design). */
  size?: "default" | "hero";
};

export function PrimaryCtaLink({ href, children, target, className = "", size = "default" }: Props) {
  const sizeClass = size === "hero" ? primaryCtaSizeHero : primaryCtaSizeDefault;
  return (
    <Link
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      className={`${primaryCtaBase} ${sizeClass} ${className}`.trim()}
    >
      <span className="min-w-0 break-words text-balance sm:whitespace-nowrap">{children}</span>
      <ArrowInCircle variant="on-brand" />
    </Link>
  );
}
