import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
import type { CostComparisonSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function CostComparisonSection({ section, lang }: { section: CostComparisonSectionT; lang: Locale }) {
  return (
    <section className="bg-surface/50 py-16 md:py-20">
      <Container>
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            {section.title && (
              <h2 className="text-3xl font-bold leading-tight tracking-[-0.04em] text-navy sm:text-4xl lg:text-[48px] lg:leading-[56px]">
                {section.title}
              </h2>
            )}
            {section.text && <RichText html={section.text} className="mt-5 text-base leading-relaxed text-muted" />}
            <div className="mt-7 flex flex-wrap gap-2.5">
              {section.ctas.map((c, i) => {
                const l = resolveLink(c.url, lang);
                if (!c.text && !l) return null;
                return (
                  <Button
                    key={i}
                    href={l?.href}
                    variant="primary"
                    className="h-12 min-w-0 gap-2.5 rounded-[24px] px-4 text-base font-medium shadow-[0px_6px_20px_0px_rgba(57,144,240,0.45)]"
                    target={l?.target}
                  >
                    {c.text || l?.label}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="relative flex min-h-0 justify-center lg:justify-end">
            <div
              className="absolute right-0 top-3 z-0 hidden h-[32rem] w-72 rotate-[-4deg] rounded-[14px] bg-brand lg:-right-4 lg:block"
              style={{ maxWidth: "100%" }}
              aria-hidden
            />
            <div className="relative z-10 w-full max-w-[460px] rounded-[14px] bg-white p-7 shadow-[0px_4px_54px_0px_rgba(67,87,128,0.25)] sm:p-9">
              {section.lossItems.length > 0 && (
                <ul className="space-y-3.5">
                  {section.lossItems.map((x, i) => (
                    <li
                      key={i}
                      className="flex min-h-[46px] items-center justify-between gap-2 rounded-[10px] bg-surface px-3.5 py-2.5"
                    >
                      <span className="text-sm leading-snug text-muted">{x.label}</span>
                      <span className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-center text-xs font-bold text-[#ff4d4d]">
                        {x.value}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {(section.price || section.priceLabel || section.priceSubtext) && (
                <div className="mt-3 rounded-[10px] bg-surface p-5 text-center sm:mt-4 sm:p-8">
                  {section.priceLabel && <p className="text-sm leading-relaxed text-muted">{section.priceLabel}</p>}
                  {section.price && (
                    <p className="mt-1 text-2xl font-extrabold leading-tight tracking-[-0.04em] text-navy sm:text-[34px] sm:leading-tight">
                      {section.price}
                    </p>
                  )}
                  {section.priceSubtext && (
                    <p className="mt-1.5 text-sm font-medium text-brand-soft">{section.priceSubtext}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
