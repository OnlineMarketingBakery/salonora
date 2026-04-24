import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Media } from "@/components/ui/Media";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
import type { BenefitsGridSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

const gridStyle = {
  backgroundImage: `
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
  backgroundSize: "28px 28px",
} as const;

export function BenefitsGridSection({ section, lang }: { section: BenefitsGridSectionT; lang: Locale }) {
  return (
    <section className="relative overflow-hidden bg-navy-deep py-16 text-white md:py-24">
      <div className="pointer-events-none absolute inset-0 opacity-40" style={gridStyle} aria-hidden />
      <Container>
        {section.eyebrow && <p className="text-sm font-bold text-brand sm:text-base">{section.eyebrow}</p>}
        {section.title && (
          <h2 className="mt-2 text-3xl font-bold leading-tight tracking-[-0.04em] sm:text-4xl lg:text-[48px] lg:leading-[56px]">
            {section.title}
          </h2>
        )}
        {section.intro && <RichText html={section.intro} className="mt-4 max-w-2xl text-surface/90" />}
        <div className="relative z-[1] mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {section.items.map((b, i) => (
            <div
              key={i}
              className="rounded-[14px] border border-white/10 bg-white/[0.06] p-4 shadow-sm shadow-black/10 backdrop-blur-sm sm:p-5"
            >
              {b.icon && <Media image={b.icon} width={40} height={40} className="mb-2.5 h-10 w-10 object-contain" />}
              <h3 className="text-lg font-bold leading-snug">{b.title}</h3>
              {b.text && <RichText html={b.text} className="mt-2 text-sm leading-relaxed text-surface/80" />}
            </div>
          ))}
        </div>
        {section.urgencyText && (
          <RichText html={section.urgencyText} className="mt-10 text-center text-sm text-surface/75" />
        )}
        <div className="mt-12 flex flex-col items-center gap-6 md:flex-row md:justify-center">
          {section.bannerLeftImage && <Media image={section.bannerLeftImage} width={120} height={120} className="h-24 w-24 rounded-full" />}
          {section.bannerText && <RichText html={section.bannerText} className="max-w-md text-center text-sm" />}
          {section.bannerRightImage && <Media image={section.bannerRightImage} width={120} height={120} className="h-24 w-24 rounded-full" />}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {section.ctas.map((c, i) => {
            const l = resolveLink(c.url, lang);
            if (!c.text && !l) return null;
            return (
              <Button key={i} href={l?.href} variant="white" target={l?.target}>
                {c.text || l?.label}
              </Button>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
