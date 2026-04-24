import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowInCircle } from "@/components/ui/ArrowInCircle";

/** Matches hero secondary CTA: white pill on dark/brand — for benefits banner, etc. */
const whiteCtaClassName =
  "group inline-flex h-12 w-full min-w-0 max-w-full items-center justify-center gap-[17px] rounded-[24px] bg-white px-3.5 text-base font-medium font-sans leading-normal text-navy shadow-[0px_6px_20px_0px_rgba(57,144,240,0.54)] transition hover:brightness-[0.99]";

type Props = { href: string; children: ReactNode; target?: string; className?: string };

export function WhiteCtaLink({ href, children, target, className = "" }: Props) {
  return (
    <Link
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      className={`${whiteCtaClassName} ${className}`.trim()}
    >
      <span className="min-w-0 break-words text-balance text-center sm:whitespace-nowrap">{children}</span>
      <ArrowInCircle variant="on-light" />
    </Link>
  );
}
