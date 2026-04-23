import Link from "next/link";
import type { ReactNode } from "react";

const variants = {
  primary:
    "bg-[#1e5bb8] text-white hover:bg-[#154a9a] shadow-md shadow-blue-900/10",
  secondary:
    "bg-white text-[#1e5bb8] border-2 border-[#1e5bb8] hover:bg-sky-50",
  ghost: "bg-transparent text-white border-2 border-white/80 hover:bg-white/10",
  dark: "bg-[#0c1d3a] text-white hover:bg-[#152a4d]",
  white: "bg-white text-[#0c1d3a] hover:bg-sky-50",
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
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1e5bb8]";
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
