import type { Locale } from "@/lib/i18n/locales";
import type { PostTocItem } from "@/lib/blog/post-html";

const COPY = {
  nl: { title: "Inhoudsopgave" },
  en: { title: "Table of contents" },
} as const;

const TOC_SCROLL =
  "[scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:color-mix(in_srgb,var(--palette-brand)_48%,transparent)_color-mix(in_srgb,var(--palette-brand)_12%,transparent)] " +
  "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:my-1 [&::-webkit-scrollbar-track]:rounded-full " +
  "[&::-webkit-scrollbar-track]:bg-[color-mix(in_srgb,var(--palette-brand)_10%,transparent)] " +
  "[&::-webkit-scrollbar-thumb]:rounded-full " +
  "[&::-webkit-scrollbar-thumb]:bg-[color-mix(in_srgb,var(--palette-brand)_40%,transparent)] " +
  "hover:[&::-webkit-scrollbar-thumb]:bg-[color-mix(in_srgb,var(--palette-brand)_62%,transparent)]";

function TocListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 22 22" fill="none" aria-hidden>
      <path
        d="M4 6h14M4 11h14M4 16h10"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PostTableOfContents({
  items,
  lang,
  variant = "post",
}: {
  items: PostTocItem[];
  lang: Locale;
  variant?: "post" | "case_study";
}) {
  if (items.length === 0) return null;
  const t = COPY[lang];

  if (variant === "case_study") {
    return (
      <nav
        aria-labelledby="post-toc-heading"
        className="flex max-h-none flex-col overflow-hidden rounded-[14px] bg-surface lg:max-h-[min(44svh,25.5rem)]"
      >
        <h2
          id="post-toc-heading"
          className="shrink-0 px-[30px] pt-[30px] text-2xl font-semibold leading-[1.1] text-navy"
        >
          {t.title}
        </h2>
        <ul
          className={`mt-6 min-h-0 list-none overflow-y-auto overscroll-y-contain px-[30px] pb-[30px] text-base leading-[1.4] ${TOC_SCROLL}`}
        >
          {items.map((item, index) => {
            const isSub = item.level === 3;
            const sep =
              index > 0
                ? "mt-0 border-t border-[color-mix(in_srgb,var(--palette-brand)_14%,transparent)] pt-3.5"
                : "";
            const rowIndent = isSub ? "ps-5" : "";
            const liClass = [sep, rowIndent].filter(Boolean).join(" ");
            const linkTone =
              index === 0
                ? "text-navy hover:text-brand"
                : "text-muted hover:text-brand";

            return (
              <li key={`${item.level}-${item.id}`} className={liClass || undefined}>
                <a
                  href={`#${item.id}`}
                  className={`grid grid-cols-[10px_minmax(0,1fr)] items-start gap-x-[11px] leading-[1.4] hover:underline ${linkTone}`}
                >
                  <span className="flex shrink-0 justify-center pt-[0.35em]" aria-hidden>
                    <span className="size-[10px] shrink-0 rounded-full bg-brand" />
                  </span>
                  <span className="min-w-0">{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  /** Figma 1643:210–233 — blog single TOC (307×556, brand header, white rows). */
  return (
    <nav
      aria-labelledby="post-toc-heading"
      className="flex max-h-none w-full max-w-[19.1875rem] flex-col overflow-hidden rounded-[12px] bg-[#ebf3fe] lg:max-h-[34.75rem]"
    >
      <div className="flex h-[52px] shrink-0 items-center gap-[7px] rounded-t-[14px] bg-brand pl-[19px] pr-[19px]">
        <TocListIcon className="size-[22px] shrink-0 text-white" />
        <h2 id="post-toc-heading" className="text-[24px] font-semibold leading-[1.1] text-white">
          {t.title}
        </h2>
      </div>
      <ul
        className={`flex min-h-0 list-none flex-col gap-[10px] overflow-y-auto overscroll-y-contain px-[18px] py-[18px] ${TOC_SCROLL}`}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.level}-${item.id}`}>
              <a
                href={`#${item.id}`}
                className={`flex items-center rounded-[10px] bg-white px-[34px] text-[14px] font-normal leading-[1.28] text-navy transition hover:text-brand hover:underline ${
                  isLast ? "min-h-[42px] py-2.5" : "min-h-[61px] py-3"
                }`}
              >
                <span className="min-w-0">{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
