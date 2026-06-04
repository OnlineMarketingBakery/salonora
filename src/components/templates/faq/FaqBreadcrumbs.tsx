import Link from "next/link";
import { buildLocalePath } from "@/lib/i18n/get-alternates";
import type { Locale } from "@/lib/i18n/locales";

const COPY = {
  nl: { home: "Home", current: "FAQ" },
  en: { home: "Home", current: "FAQ" },
} as const;

/** Single FAQ breadcrumb trail — render only in the page hero. */
export function FaqBreadcrumbs({ lang }: { lang: Locale }) {
  const copy = COPY[lang];

  return (
    <nav aria-label="Breadcrumb" className="faq-page-breadcrumbs legal-breadcrumbs min-w-0">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-navy/90">
        <li className="min-w-0">
          <Link
            href={buildLocalePath(lang)}
            className="text-brand transition-colors hover:text-brand-strong hover:underline"
          >
            {copy.home}
          </Link>
        </li>
        <li className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-brand/50 select-none" aria-hidden>
            /
          </span>
          <span className="truncate text-navy" aria-current="page">
            {copy.current}
          </span>
        </li>
      </ol>
    </nav>
  );
}
