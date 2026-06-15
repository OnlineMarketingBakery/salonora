import { formatHeadingCase } from "@/lib/i18n/format-heading";
import { Container } from "@/components/ui/Container";
import { LegalBreadcrumbs } from "@/components/templates/legal/LegalBreadcrumbs";
import { LegalPageColumn } from "@/components/templates/legal/LegalPageColumn";
import { getLegalBreadcrumbs } from "@/lib/legal/legal-breadcrumbs";
import { decodeHtmlEntitiesPlain } from "@/lib/utils/decode-html-entities-plain";
import {
  getLegalLastUpdated,
  legalGdprBadge,
  legalLastUpdatedLabel,
} from "@/lib/legal/legal-meta";
import type { Locale } from "@/lib/i18n/locales";

function EuFlagIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0 rounded-full"
      viewBox="0 0 24 24"
      aria-hidden
      role="img"
    >
      <circle cx="12" cy="12" r="12" fill="#003399" />
      <g fill="#FFCC00">
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
          const rad = ((deg - 90) * Math.PI) / 180;
          const x = 12 + 5.5 * Math.cos(rad);
          const y = 12 + 5.5 * Math.sin(rad);
          return <circle key={deg} cx={x} cy={y} r="0.9" />;
        })}
      </g>
    </svg>
  );
}

function EuGdprBadge({ lang }: { lang: Locale }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--palette-brand)_22%,transparent)] bg-white px-3.5 py-1.5 text-sm font-semibold text-navy shadow-[0_4px_14px_-4px_rgba(21,41,81,0.15)]">
      <EuFlagIcon />
      {legalGdprBadge(lang)}
    </span>
  );
}

export function LegalPageHero({
  title,
  slug,
  lang,
  showTrustMeta = true,
}: {
  title: string;
  slug: string;
  lang: Locale;
  showTrustMeta?: boolean;
}) {
  const lastUpdated = showTrustMeta ? getLegalLastUpdated(lang, slug) : null;
  const displayTitle = formatHeadingCase(decodeHtmlEntitiesPlain(title));
  const breadcrumbs = getLegalBreadcrumbs(lang, slug, displayTitle);

  return (
    <header className="legal-page-hero">
      <Container padding="header" className="legal-page-hero-wrap">
        <LegalPageColumn className="legal-page-hero-inner">
          <LegalBreadcrumbs items={breadcrumbs} />

          <h1 className="mt-4 text-[1.75rem] font-bold leading-tight text-navy-deep sm:text-3xl md:text-[2.125rem]">
            {displayTitle}
          </h1>

          {showTrustMeta ? (
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
              <EuGdprBadge lang={lang} />
              {lastUpdated ? (
                <p className="text-sm text-navy">
                  <span className="font-semibold">{legalLastUpdatedLabel(lang)}:</span>{" "}
                  <time dateTime={lastUpdated}>{lastUpdated}</time>
                </p>
              ) : null}
            </div>
          ) : null}
        </LegalPageColumn>
      </Container>
    </header>
  );
}
