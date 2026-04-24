"use client";

import Link from "next/link";
import { useLayoutEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { buildLocalePath } from "@/lib/i18n/get-alternates";
import { supportedLocales } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/locales";

type Props = {
  lang: Locale;
  className?: string;
  variant?: "default" | "header";
  /** Pathname from the server (middleware `x-pathname`) for the current document. */
  serverPathname: string;
  /** Polylang-aware hrefs from `getLocaleHrefsForPathname` (or null if unresolvable on the server). */
  serverLocaleHrefs: Record<Locale, string> | null;
};

/** Path after the first segment if it is a supported locale. */
function pathAfterLocalePrefix(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "";
  const [first, ...rest] = segments;
  if (supportedLocales.includes(first as Locale)) {
    return rest.join("/");
  }
  return segments.join("/");
}

function sameSlugHrefs(pathname: string): Record<Locale, string> {
  const p = pathAfterLocalePrefix(pathname);
  return Object.fromEntries(
    supportedLocales.map((l) => [l, buildLocalePath(l, p)])
  ) as Record<Locale, string>;
}

export function LanguageSwitcher({
  lang,
  className = "",
  variant = "default",
  serverPathname,
  serverLocaleHrefs,
}: Props) {
  const pathname = usePathname() || "/";
  const sameSlugFallback = useMemo(() => sameSlugHrefs(pathname), [pathname]);
  const [fetched, setFetched] = useState<Record<Locale, string> | null>(null);

  const serverSolved =
    pathname === serverPathname
      ? (serverLocaleHrefs ?? sameSlugFallback)
      : null;
  const hrefs: Record<Locale, string> = fetched ?? serverSolved ?? sameSlugFallback;

  useLayoutEffect(() => {
    if (pathname === serverPathname) {
      setFetched(null);
      return;
    }
    let cancelled = false;
    setFetched(null);
    const run = async () => {
      try {
        const res = await fetch(
          `/api/locale-hrefs?pathname=${encodeURIComponent(pathname)}`
        );
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { hrefs: Record<Locale, string> };
        if (!cancelled && data.hrefs) {
          setFetched(data.hrefs);
        }
      } catch {
        /* keep fallback */
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [pathname, serverPathname]);

  if (variant === "header") {
    return (
      <div className={`flex items-center gap-1 ${className}`} role="navigation" aria-label="Language">
        {supportedLocales.map((l, i) => (
          <span key={l} className="flex items-center">
            {i > 0 ? <span className="mx-1.5 h-3 w-px shrink-0 bg-muted/25" aria-hidden /> : null}
            <Link
              href={hrefs[l] ?? buildLocalePath(l, pathAfterLocalePrefix(pathname))}
              className={
                l === lang
                  ? "rounded-full bg-zinc-100/95 px-3 py-1.5 text-[12px] font-semibold tracking-[0.1em] text-navy"
                  : "rounded-full px-2.5 py-1.5 text-[12px] font-medium tracking-[0.1em] text-muted/70 transition hover:text-navy"
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
          href={hrefs[l] ?? buildLocalePath(l, pathAfterLocalePrefix(pathname))}
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
