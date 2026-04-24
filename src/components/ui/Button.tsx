import Link from "next/link";
import type { ReactNode } from "react";

const textBody = "text-base font-medium font-sans leading-normal";
const textWhite = "text-white";

const variants = {
  primary: `bg-brand ${textWhite} hover:brightness-95 shadow-md shadow-navy-deep/10 ${textBody}`,
  secondary: `bg-white text-brand border-2 border-brand hover:bg-surface ${textBody}`,
  ghost: `bg-transparent border-2 border-white/80 text-white hover:bg-white/10 ${textBody}`,
  dark: `bg-navy-deep ${textWhite} hover:bg-navy ${textBody}`,
  white: `bg-white text-foreground hover:bg-surface ${textBody}`,
  /** Figma: white card CTA in footer & secondary hero */
  elevated: `bg-white text-navy shadow-[0px_6px_20px_0px_rgba(57,144,240,0.54)] border-0 hover:brightness-[0.99] ${textBody}`,
} as const;

type Variant = keyof typeof variants;

type Props = {
  href?: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  target?: string;
  disabled?: boolean;
};

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
  type = "button",
  onClick,
  target,
  disabled,
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-full px-6 py-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand";
  const dis = disabled ? "pointer-events-none opacity-60" : "";
  const cls = `${base} ${variants[variant]} ${dis} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls} target={target} rel={target === "_blank" ? "noopener noreferrer" : undefined}>
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
