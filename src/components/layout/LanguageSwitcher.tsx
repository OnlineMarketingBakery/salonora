"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buildLocalePath } from "@/lib/i18n/get-alternates";
import { supportedLocales } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/locales";

type Props = { lang: Locale; className?: string; variant?: "default" | "header" };

/** Path after the first segment if it is a supported locale (avoids relying on `lang` matching the URL). */
function pathAfterLocalePrefix(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "";
  const [first, ...rest] = segments;
  if (supportedLocales.includes(first as Locale)) {
    return rest.join("/");
  }
  return segments.join("/");
}

export function LanguageSwitcher({ lang, className = "", variant = "default" }: Props) {
  const pathname = usePathname() || "/";
  const pathRest = pathAfterLocalePrefix(pathname);

  if (variant === "header") {
    return (
      <div className={`flex items-center gap-1 ${className}`} role="navigation" aria-label="Language">
        {supportedLocales.map((l, i) => (
          <span key={l} className="flex items-center">
            {i > 0 ? <span className="mx-1.5 h-3 w-px shrink-0 bg-muted/25" aria-hidden /> : null}
            <Link
              href={buildLocalePath(l, pathRest)}
              className={
                l === lang
                  ? "rounded-full border border-surface bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-navy shadow-sm"
                  : "rounded-full px-2.5 py-1 text-[11px] font-medium tracking-[0.14em] text-muted/60 transition hover:text-navy"
              }
              hrefLang={l}
            >
              {l.toUpperCase()}
            </Link>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-sm font-medium ${className}`} role="navigation" aria-label="Language">
      {supportedLocales.map((l) => (
        <Link
          key={l}
          href={buildLocalePath(l, pathRest)}
          className={
            l === lang
              ? "rounded-md bg-surface px-2 py-1 text-foreground"
              : "px-2 py-1 text-muted hover:text-brand"
          }
          hrefLang={l}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
