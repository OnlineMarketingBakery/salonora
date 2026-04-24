import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Media } from "@/components/ui/Media";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
import type { HeroSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function HeroSection({ section, lang }: { section: HeroSectionT; lang: Locale }) {
  const p = resolveLink(section.primaryCta, lang);
  const s = resolveLink(section.secondaryCta, lang);
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-100/90 via-sky-50/80 to-white pb-16 pt-8 md:pt-12">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            {section.eyebrow && (
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#1e5bb8]">
                {section.eyebrow}
              </p>
            )}
            <h1 className="text-3xl font-bold leading-tight text-[#0c1d3a] sm:text-4xl md:text-[2.4rem] md:leading-tight">
              {section.title}
            </h1>
            {section.text && <RichText html={section.text} className="mt-4 text-slate-600" />}
            {section.offerText && <RichText html={section.offerText} className="mt-3 text-sm text-[#0c1d3a]/90" />}
            <div className="mt-8 flex flex-wrap gap-3">
              {p && <Button href={p.href} variant="primary" target={p.target}>{p.label}</Button>}
              {s && <Button href={s.href} variant="secondary" target={s.target}>{s.label}</Button>}
            </div>
            {section.trustImage && (
              <div className="mt-8 flex items-center gap-3">
                <Media image={section.trustImage} width={160} height={32} className="h-8 w-auto" />
              </div>
            )}
          </div>
          <div className="relative flex justify-center lg:justify-end">
            {section.image && (
              <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl border border-sky-100/80 bg-white/60 shadow-lg shadow-sky-200/40">
                <Media
                  image={section.image}
                  className="h-full w-full rounded-3xl"
                  width={500}
                  height={625}
                />
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
