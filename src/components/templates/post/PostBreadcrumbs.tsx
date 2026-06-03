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
      {/* Figma 1643:235+ hero has no visible "Blog / title" trail — keep for a11y only */}
      <nav aria-label="Breadcrumb" className="sr-only">
        <ol>
          <li>
            <Link href={buildLocalePath(lang, blogArchivePath)}>{t.blog}</Link>
          </li>
          {!breadcrumbParent ? (
            <>
              <CrumbSep />
              <li aria-current="page">{titlePlain}</li>
            </>
          ) : (
            <li className="sr-only" aria-current="page">
              {titlePlain}
            </li>
          )}
        </ol>
      </nav>
    </div>
  );
}
