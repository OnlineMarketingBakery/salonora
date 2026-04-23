import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Media } from "@/components/ui/Media";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
import type { PricingPackagesSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function PricingPackagesSection({ section, lang }: { section: PricingPackagesSectionT; lang: Locale }) {
  return (
    <section className="py-16 md:py-24">
      <Container>
        {section.eyebrow && <p className="text-center text-sm font-semibold text-[#1e5bb8]">{section.eyebrow}</p>}
        {section.title && <h2 className="mt-2 text-center text-2xl font-bold text-[#0c1d3a] sm:text-3xl">{section.title}</h2>}
        {section.intro && <RichText html={section.intro} className="mx-auto mt-4 max-w-2xl text-center text-slate-600" />}
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {section.items.map((p, i) => (
            <div
              key={i}
              className={`flex h-full flex-col rounded-2xl border p-8 ${
                p.featured
                  ? "border-[#1e5bb8] bg-gradient-to-b from-sky-50 to-white shadow-xl"
                  : "border-sky-100 bg-white"
              }`}
            >
              {p.badge && <span className="text-xs font-bold uppercase text-[#1e5bb8]">{p.badge}</span>}
              <h3 className="mt-2 text-xl font-bold text-[#0c1d3a]">{p.title}</h3>
              {p.intro && <RichText html={p.intro} className="mt-2 text-sm text-slate-600" />}
              {p.priceLine && <RichText html={p.priceLine} className="mt-4 text-2xl font-bold text-[#0c1d3a]" />}
              {p.includes.length > 0 && (
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {p.includes.map((x, j) => (
                    <li key={j} className="flex gap-2">
                      {x.icon && <Media image={x.icon} width={20} height={20} className="h-5 w-5" />}
                      <span>{x.text}</span>
                    </li>
                  ))}
                </ul>
              )}
              {p.solvesTitle && <RichText html={p.solvesTitle} className="mt-4 text-sm font-semibold" />}
              {p.solvesItems.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  {p.solvesItems.map((x, j) => (
                    <li key={j} className="flex gap-2">
                      {x.icon && <Media image={x.icon} width={18} height={18} className="h-4 w-4" />}
                      {x.text}
                    </li>
                  ))}
                </ul>
              )}
              {p.note && <RichText html={p.note} className="mt-4 text-xs text-slate-500" />}
              {p.smallPrint && <p className="mt-2 text-xs text-slate-400">{p.smallPrint}</p>}
              <div className="mt-6 flex flex-1 flex-col justify-end gap-2">
                {p.ctas.map((c, j) => {
                  const l = resolveLink(c.url, lang);
                  return (
                    <Button key={j} href={l?.href} variant={p.featured ? "dark" : "primary"} className="w-full" target={l?.target}>
                      {c.text || l?.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {section.bottomNote && <RichText html={section.bottomNote} className="mt-8 text-center text-sm text-slate-500" />}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {section.ctas.map((c, i) => {
            const l = resolveLink(c.url, lang);
            return (
              <Button key={i} href={l?.href} variant="secondary" target={l?.target}>
                {c.text || l?.label}
              </Button>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
