import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Media } from "@/components/ui/Media";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
import type { PricingPackagesSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

const titleClass =
  "text-3xl font-bold leading-tight tracking-[-0.04em] text-navy sm:text-4xl lg:text-[48px] lg:leading-[56px]";

export function PricingPackagesSection({ section, lang }: { section: PricingPackagesSectionT; lang: Locale }) {
  return (
    <section className="bg-surface py-16 md:py-24">
      <Container>
        <div className="mb-10 flex flex-col items-center text-center sm:mb-12">
          {section.eyebrow && (
            <p className="mb-2 inline-block rounded-full bg-white px-4 py-2.5 text-base font-bold text-brand shadow-sm sm:px-5">
              {section.eyebrow}
            </p>
          )}
          {section.title && <h2 className={`${titleClass} max-w-3xl`}>{section.title}</h2>}
        </div>
        {section.intro && (
          <RichText html={section.intro} className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted" />
        )}
        <div className="mt-10 grid gap-6 md:grid-cols-2 md:gap-8 lg:mt-12">
          {section.items.map((p, i) => (
            <div
              key={i}
              className={`flex h-full flex-col rounded-[20px] p-6 sm:p-8 lg:p-10 ${
                p.featured
                  ? "border-2 border-brand bg-white shadow-lg shadow-brand/20"
                  : "border border-surface/60 bg-white shadow-sm"
              }`}
            >
              {p.badge && (
                <span className="w-fit rounded-full bg-brand/10 px-3 py-0.5 text-xs font-bold uppercase text-brand">
                  {p.badge}
                </span>
              )}
              <h3 className="mt-2 text-2xl font-bold leading-tight text-navy-deep sm:text-3xl">
                {p.title}
              </h3>
              {p.intro && <RichText html={p.intro} className="mt-2.5 text-sm text-muted" />}
              {p.priceLine && <RichText html={p.priceLine} className="mt-3 text-xl font-bold text-navy-deep" />}
              {p.includes.length > 0 && (
                <ul className="mt-4 space-y-2.5 text-sm text-navy-deep">
                  {p.includes.map((x, j) => (
                    <li
                      key={j}
                      className="flex min-h-10 items-center gap-1.5 rounded-full bg-pill px-3.5 py-1.5 sm:px-3"
                    >
                      {x.icon && <Media image={x.icon} width={22} height={22} className="h-5 w-5 shrink-0" />}
                      <span className="text-sm font-normal leading-relaxed text-navy-deep sm:text-sm">{x.text}</span>
                    </li>
                  ))}
                </ul>
              )}
              {p.solvesTitle && <RichText html={p.solvesTitle} className="mt-5 text-sm font-bold text-navy-deep" />}
              {p.solvesItems.length > 0 && (
                <ul className="mt-2.5 list-disc space-y-1.5 pl-4 text-sm text-muted marker:text-navy/40">
                  {p.solvesItems.map((x, j) => (
                    <li key={j} className="flex items-start gap-1.5 pl-0.5">
                      {x.icon && <Media image={x.icon} width={16} height={16} className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
                      <span className="leading-relaxed">{x.text}</span>
                    </li>
                  ))}
                </ul>
              )}
              {p.note && <RichText html={p.note} className="mt-3 text-sm font-semibold text-[#1d5898]" />}
              {p.smallPrint && <p className="mt-1 text-xs text-muted/80">{p.smallPrint}</p>}
              <div className="mt-6 flex flex-1 flex-col justify-end gap-2">
                {p.ctas.map((c, j) => {
                  const l = resolveLink(c.url, lang);
                  return (
                    <Button
                      key={j}
                      href={l?.href}
                      variant={p.featured ? "dark" : "primary"}
                      className={`h-12 w-full rounded-full text-base font-medium ${
                        p.featured
                          ? "px-4 shadow-md"
                          : "rounded-[31.5px] border-0 bg-brand py-3.5 text-white shadow-lg shadow-brand/30"
                      }`}
                      target={l?.target}
                    >
                      {c.text || l?.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {section.bottomNote && (
          <RichText html={section.bottomNote} className="mt-8 text-center text-sm text-muted" />
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          {section.ctas.map((c, i) => {
            const l = resolveLink(c.url, lang);
            return (
              <Button
                key={i}
                href={l?.href}
                variant="secondary"
                className="h-11 rounded-full border-2 px-4 text-sm font-medium"
                target={l?.target}
              >
                {c.text || l?.label}
              </Button>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
