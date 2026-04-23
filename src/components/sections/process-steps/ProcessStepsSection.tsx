import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
import type { ProcessStepsSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function ProcessStepsSection({ section, lang }: { section: ProcessStepsSectionT; lang: Locale }) {
  return (
    <section className="bg-[#0c1d3a] py-16 text-white md:py-24">
      <Container>
        {section.title && <h2 className="text-center text-2xl font-bold sm:text-3xl">{section.title}</h2>}
        {section.intro && <RichText html={section.intro} className="mx-auto mt-4 max-w-2xl text-center text-sky-100/90" />}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {section.items.map((s, i) => (
            <div
              key={i}
              className={`rounded-2xl border p-6 ${
                s.highlight
                  ? "border-[#1e5bb8] bg-[#1e5bb8]/20 shadow-lg"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <p className="text-2xl font-bold text-sky-300">{s.number}</p>
              <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
              {s.text && <RichText html={s.text} className="mt-2 text-sm text-sky-100/85" />}
            </div>
          ))}
        </div>
        {section.smallText && <p className="mt-8 text-center text-xs text-sky-200/80">{section.smallText}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {section.ctas.map((c, i) => {
            const l = resolveLink(c.url, lang);
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
