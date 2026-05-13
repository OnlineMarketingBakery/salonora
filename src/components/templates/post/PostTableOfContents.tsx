import type { Locale } from "@/lib/i18n/locales";
import type { PostTocItem } from "@/lib/blog/post-html";

const COPY = {
  nl: { title: "Inhoudsopgave" },
  en: { title: "Table of contents" },
} as const;

/** Figma 848:3514 — 10px brand dots, 11px gutter */
const TOC_SCROLL =
  "[scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:color-mix(in_srgb,var(--palette-brand)_48%,transparent)_color-mix(in_srgb,var(--palette-brand)_12%,transparent)] " +
  "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:my-1 [&::-webkit-scrollbar-track]:rounded-full " +
  "[&::-webkit-scrollbar-track]:bg-[color-mix(in_srgb,var(--palette-brand)_10%,transparent)] " +
  "[&::-webkit-scrollbar-thumb]:rounded-full " +
  "[&::-webkit-scrollbar-thumb]:bg-[color-mix(in_srgb,var(--palette-brand)_40%,transparent)] " +
  "hover:[&::-webkit-scrollbar-thumb]:bg-[color-mix(in_srgb,var(--palette-brand)_62%,transparent)]";

export function PostTableOfContents({
  items,
  lang,
  variant = "post",
}: {
  items: PostTocItem[];
  lang: Locale;
  /** Case study single (Figma 879:27): surface card without outline. */
  variant?: "post" | "case_study";
}) {
  if (items.length === 0) return null;
  const t = COPY[lang];
  const shell =
    variant === "case_study"
      ? "flex max-h-none flex-col overflow-hidden rounded-[14px] bg-[var(--palette-surface)] lg:max-h-[min(44svh,25.5rem)]"
      : "flex max-h-none flex-col overflow-hidden rounded-[14px] border border-[color-mix(in_srgb,var(--palette-brand)_16%,transparent)] bg-[var(--palette-surface)] lg:max-h-[min(44svh,25.5rem)]";
  return (
    <nav aria-labelledby="post-toc-heading" className={shell}>
      <h2
        id="post-toc-heading"
        className="shrink-0 px-[30px] pt-[30px] text-2xl font-semibold leading-[1.1] text-[var(--palette-navy)]"
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
              ? "text-[var(--palette-navy)] hover:text-[var(--palette-brand)]"
              : "text-[var(--palette-muted)] hover:text-[var(--palette-brand)]";

          return (
            <li key={`${item.level}-${item.id}`} className={liClass || undefined}>
              <a
                href={`#${item.id}`}
                className={`grid grid-cols-[10px_minmax(0,1fr)] items-start gap-x-[11px] leading-[1.4] hover:underline ${linkTone}`}
              >
                <span className="flex shrink-0 justify-center pt-[0.35em]" aria-hidden>
                  <span className="size-[10px] shrink-0 rounded-full bg-[var(--palette-brand)]" />
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
