"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buildLocalePath } from "@/lib/i18n/get-alternates";
import { supportedLocales } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/locales";

type Props = { lang: Locale; className?: string };

export function LanguageSwitcher({ lang, className = "" }: Props) {
  const pathname = usePathname() || "/";
  const without = pathname.replace(new RegExp(`^/${lang}`), "") || "/";
  return (
    <div className={`flex items-center gap-2 text-sm font-medium ${className}`} role="navigation" aria-label="Language">
      {supportedLocales.map((l) => (
        <Link
          key={l}
          href={buildLocalePath(l, without === "/" ? "" : without.replace(/^\//, ""))}
          className={
            l === lang
              ? "rounded-md bg-sky-100 px-2 py-1 text-[#0c1d3a]"
              : "px-2 py-1 text-slate-500 hover:text-[#1e5bb8]"
          }
          hrefLang={l}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
