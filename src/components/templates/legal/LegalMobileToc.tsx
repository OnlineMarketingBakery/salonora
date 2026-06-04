import { legalTocLabel } from "@/lib/legal/legal-labels";
import type { LegalHeading } from "@/lib/legal/parse-legal-html";
import type { Locale } from "@/lib/i18n/locales";

export function LegalMobileToc({
  headings,
  lang,
}: {
  headings: LegalHeading[];
  lang: Locale;
}) {
  if (headings.length === 0) return null;
  const label = legalTocLabel(lang);

  return (
    <details className="legal-mobile-toc group lg:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl border border-[color-mix(in_srgb,var(--palette-brand)_18%,transparent)] bg-white px-4 py-3.5 text-base font-semibold text-navy-deep shadow-sm marker:content-none [&::-webkit-details-marker]:hidden">
        <span>{label}</span>
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-brand transition-transform group-open:rotate-180"
          aria-hidden
        >
          ▾
        </span>
      </summary>
      <nav className="mt-3 rounded-xl border border-surface bg-white p-3 shadow-sm" aria-label={label}>
        <ol className="flex flex-col gap-0.5">
          {headings.map((h, index) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className="legal-toc-link flex gap-2 rounded-lg px-3 py-2.5 text-[15px] font-medium leading-snug text-navy transition-colors hover:bg-surface hover:text-brand"
              >
                <span className="shrink-0 tabular-nums text-brand">{index + 1}.</span>
                <span>{h.label}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  );
}
