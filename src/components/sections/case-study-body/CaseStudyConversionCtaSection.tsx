import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { RichText } from "@/components/ui/RichText";
import { resolveLink } from "@/lib/utils/links";
import type { CaseStudyConversionCtaSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

/** Figma 879:27 / 892:544 — navy CTA band, radial glow, 34px title, 16px subtitle, brand pill + white disc arrow. */
export function CaseStudyConversionCtaSection({
  section,
  lang,
}: {
  section: CaseStudyConversionCtaSectionT;
  lang: Locale;
}) {
  void lang;
  const resolved = resolveLink(section.cta, lang);
  if (!section.title.trim() && !section.subtitle.trim() && !resolved) return null;

  return (
    <section className="relative overflow-hidden rounded-[24px] bg-[var(--palette-navy-deep)] px-6 py-12 text-white sm:px-12 sm:py-14 md:px-[117px] md:py-15">
      {/** Figma: `#002752` base + soft brand glows top-left & bottom-right (mesh-style depth) */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px]"
        aria-hidden
        style={{
          background: [
            "radial-gradient(ellipse 78% 62% at 0% 0%, color-mix(in srgb, var(--palette-brand) 48%, transparent) 0%, transparent 56%)",
            "radial-gradient(ellipse 75% 58% at 100% 100%, color-mix(in srgb, var(--palette-brand) 44%, transparent) 0%, transparent 54%)",
          ].join(","),
        }}
      />
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px] blur-3xl opacity-40" aria-hidden>
        <div
          className="absolute -left-[22%] -top-[42%] size-[min(85%,28rem)] rounded-full"
          style={{
            background: "radial-gradient(closest-side, color-mix(in srgb, var(--palette-brand) 50%, transparent), transparent 72%)",
          }}
        />
        <div
          className="absolute -bottom-[38%] -right-[20%] size-[min(78%,26rem)] rounded-full"
          style={{
            background: "radial-gradient(closest-side, color-mix(in srgb, var(--palette-brand) 45%, transparent), transparent 70%)",
          }}
        />
      </div>
      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-[53.6875rem] flex-col items-center text-center">
        {section.title.trim() ? (
          <SectionHeading
            as="h2"
            text={section.title}
            className="text-[34px] font-semibold leading-[1.1] text-white"
          />
        ) : null}
        {section.subtitle ? (
          <div className={section.title.trim() ? "mt-4 w-full" : "w-full"}>
            <RichText
              html={section.subtitle}
              className="max-w-none text-base font-normal leading-[1.4] text-white prose-p:my-0 prose-p:text-base prose-p:leading-[1.4] prose-p:text-white prose-a:text-white prose-strong:text-white"
            />
          </div>
        ) : null}
        {resolved ? (
          <Button
            href={resolved.href}
            target={resolved.target}
            variant="ctaBrand"
            ctaSize="default"
            ctaFullWidth={false}
            ctaJustify="center"
            className="mt-5 min-w-[10rem] shrink-0"
          >
            {resolved.label}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
