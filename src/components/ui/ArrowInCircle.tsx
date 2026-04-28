import type { ReactNode } from "react";

type Props = {
  className?: string;
  children?: ReactNode;
  borderClassName?: string;
  variant?: "on-dark" | "on-brand" | "on-light";
};

const ICON_BY_VARIANT: Record<NonNullable<Props["variant"]>, string> = {
  "on-brand": "/button-icon-primary.svg",
  "on-light": "/button-icon-dark.svg",
  "on-dark": "/button-icon-light.svg",
};

export function ArrowInCircle({ className = "", children, borderClassName, variant = "on-dark" }: Props) {
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
