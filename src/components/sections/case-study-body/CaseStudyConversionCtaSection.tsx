import Link from "next/link";
import { RichText } from "@/components/ui/RichText";
import { resolveLink } from "@/lib/utils/links";
import type { CaseStudyConversionCtaSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function CaseStudyConversionCtaSection({
  section,
  lang,
}: {
  section: CaseStudyConversionCtaSectionT;
  lang: Locale;
}) {
  const resolved = resolveLink(section.cta, lang);
  if (!section.title.trim() && !section.subtitle.trim() && !resolved) return null;

  return (
    <section className="relative overflow-hidden rounded-[14px] bg-[var(--palette-navy-deep)] px-6 py-12 text-white sm:px-[117px] sm:py-[60px]">
      <div className="pointer-events-none absolute inset-0 opacity-90" aria-hidden>
        <div className="absolute inset-y-0 left-1/2 w-[105%] max-w-[859px] -translate-x-1/2 bg-gradient-to-br from-[var(--palette-navy-deep)] via-[#002147] to-[var(--palette-navy-deep)]" />
      </div>
      <div className="relative z-10 mx-auto flex max-w-[39rem] flex-col items-center gap-[18px] text-center">
        {section.title.trim() ? (
          <h2 className="text-[28px] font-semibold leading-[1.1] text-white sm:text-[34px]">{section.title.trim()}</h2>
        ) : null}
        {section.subtitle ? (
          <RichText
            html={section.subtitle}
            className="max-w-none text-base font-normal leading-[1.4] text-white/95 prose-p:my-0 prose-p:text-white/95 prose-a:text-white prose-strong:text-white"
          />
        ) : null}
        {resolved ? (
          <Link
            href={resolved.href}
            target={resolved.target}
            rel={resolved.target === "_blank" ? "noopener noreferrer" : undefined}
            className="inline-flex h-[42px] min-w-[10rem] items-center justify-center gap-2 rounded-[24px] bg-[var(--palette-brand)] px-4 text-base font-normal text-white shadow-[0px_6px_10px_rgba(57,144,240,0.54)] transition hover:brightness-105"
          >
            {resolved.label}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
