import Link from "next/link";
import { buildLocalePath } from "@/lib/i18n/get-alternates";
import type { Locale } from "@/lib/i18n/locales";
import type { PostBreadcrumbParentT } from "@/types/documents";
import { stripTags } from "@/lib/utils/strings";

const COPY = {
  nl: { blog: "Blog" },
  en: { blog: "Blog" },
} as const;

function CrumbSep() {
  return (
    <li aria-hidden className="px-0.5 text-[color-mix(in_srgb,var(--palette-navy)_32%,transparent)]">
      /
    </li>
  );
}

export function PostBreadcrumbs({
  lang,
  blogArchivePath,
  postTitleHtml,
  breadcrumbParent,
}: {
  lang: Locale;
  blogArchivePath: string;
  postTitleHtml: string;
  breadcrumbParent: PostBreadcrumbParentT | null;
}) {
  const t = COPY[lang];
  const titlePlain = stripTags(postTitleHtml).trim() || "—";
  return (
    <div>
      {breadcrumbParent ? (
        <a
          href={breadcrumbParent.href}
          className="block text-[24px] font-medium leading-[1.6] text-[var(--palette-brand)] transition hover:underline"
        >
          {breadcrumbParent.label}
        </a>
      ) : null}
      <nav
        aria-label="Breadcrumb"
        className={breadcrumbParent ? "sr-only" : "text-[16px] leading-[1.4] text-[var(--palette-navy)]"}
      >
        <ol className="flex flex-wrap items-center gap-x-1 gap-y-1">
          <li>
            <Link
              href={buildLocalePath(lang, blogArchivePath)}
              className="font-medium text-[var(--palette-brand)] transition hover:underline"
            >
              {t.blog}
            </Link>
          </li>
          {breadcrumbParent ? (
            <li className="sr-only" aria-current="page">
              {titlePlain}
            </li>
          ) : (
            <>
              <CrumbSep />
              <li className="font-medium text-[var(--palette-navy)]">{titlePlain}</li>
            </>
          )}
        </ol>
      </nav>
    </div>
  );
}
