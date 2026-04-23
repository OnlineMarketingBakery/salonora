import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Media } from "@/components/ui/Media";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
import type { BenefitsGridSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function BenefitsGridSection({ section, lang }: { section: BenefitsGridSectionT; lang: Locale }) {
  return (
    <section className="bg-[#0c1d3a] py-16 text-white md:py-24">
      <Container>
        {section.eyebrow && <p className="text-sm font-semibold text-sky-300">{section.eyebrow}</p>}
        {section.title && <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{section.title}</h2>}
        {section.intro && <RichText html={section.intro} className="mt-4 max-w-2xl text-sky-100/90" />}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {section.items.map((b, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
              {b.icon && <Media image={b.icon} width={40} height={40} className="mb-2 h-10 w-10 object-contain" />}
              <h3 className="font-semibold">{b.title}</h3>
              {b.text && <RichText html={b.text} className="mt-2 text-sm text-sky-100/80" />}
            </div>
          ))}
        </div>
        {section.urgencyText && (
          <RichText html={section.urgencyText} className="mt-10 text-center text-sm text-sky-200" />
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
