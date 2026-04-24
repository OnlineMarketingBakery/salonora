import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowInCircle } from "@/components/ui/ArrowInCircle";

/** Matches hero primary CTA — single source of truth. */
export const primaryCtaClassName =
  "group inline-flex h-12 max-w-full min-w-0 items-center justify-center gap-[17px] rounded-[24px] bg-brand px-3.5 text-[16px] font-medium leading-6 text-white shadow-[0px_6px_20px_0px_rgba(57,144,240,0.54)] transition hover:brightness-105 sm:text-[18px]";

type Props = {
  href: string;
  children: ReactNode;
  target?: string;
  className?: string;
};

export function PrimaryCtaLink({ href, children, target, className = "" }: Props) {
  return (
    <Link
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      className={`${primaryCtaClassName} ${className}`.trim()}
    >
      <span className="min-w-0 break-words text-balance sm:whitespace-nowrap">{children}</span>
      <ArrowInCircle variant="on-brand" />
    </Link>
  );
}
