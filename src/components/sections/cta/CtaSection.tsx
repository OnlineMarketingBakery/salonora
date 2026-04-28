import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
import { ctaVariantAt } from "@/lib/ui/ctaAlternation";
import type { CtaSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function CtaSection({ section, lang }: { section: CtaSectionT; lang: Locale }) {
  const hasBg = Boolean(section.backgroundImage?.url);
  const isCenter = section.alignment !== "left";

  return (
    <section className="relative py-12 sm:py-16 md:py-20 bg-white">
      {hasBg && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url(${section.backgroundImage!.url!})` }}
          aria-hidden
        />
      )}
      <Container className="!max-w-[85rem]">
        <div className="relative mx-auto w-full max-w-[min(100%,1301px)]">
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -z-0 hidden h-[485px] w-full -translate-x-1/2 -translate-y-1/2 rotate-[-1.73deg] rounded-[14px] bg-gradient-to-b from-brand to-[#0569d7] sm:block"
            aria-hidden
          />
          <div className="relative z-10 w-full sm:pt-0">
            <div
              className="w-full rounded-[14px] bg-white p-5 text-navy shadow-[0px_15px_20.2px_rgba(67,87,128,0.46)] sm:p-10 sm:pt-8 md:px-12 md:py-16 lg:px-16 lg:py-20 xl:px-20 xl:py-[4.5rem] 2xl:px-[84px] 2xl:py-[84px] min-h-0"
            >
              <div
                className={[
                  "mx-auto flex w-full min-w-0 max-w-[773px] flex-col gap-6",
                  isCenter ? "items-center text-center" : "items-stretch text-left",
                ].join(" ")}
              >
                {section.title && (
                  <h2
                    className={[
                      "w-full min-w-0 text-[40px] font-semibold leading-tight tracking-[-0.04em] text-navy sm:text-[48px] sm:leading-[56px] [text-wrap:balance]",
                      !isCenter && "!text-left",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {section.title}
                  </h2>
                )}
                {section.text && (
                  <RichText
                    html={section.text}
                    className={[
                      "w-full",
                      "!prose-p:mb-0 !prose-p:mt-0",
                      "!prose-p:max-w-none",
                      isCenter ? "!prose-p:text-center" : "!prose-p:text-left",
                      "!prose-p:font-sans",
                      "!prose-p:text-base",
                      "!prose-p:font-normal",
                      "!prose-p:leading-[1.4]",
                      "!prose-p:!text-navy",
                      "[&_p+_p]:!mt-3.5",
                      "[&_a]:!text-navy",
                      "[&_strong]:!text-navy",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  />
                )}
                {section.ctas.length > 0 && (
                  <div
                    className={[
                      "mt-0 flex w-full min-w-0 max-w-full flex-col gap-2.5",
                      isCenter
                        ? "items-stretch sm:flex-row sm:items-center sm:justify-center"
                        : "items-stretch sm:flex-row",
                    ].join(" ")}
                  >
                    {section.ctas.map((c, i) => {
                      const l = resolveLink(c.url, lang);
                      if (!c.text && !l) return null;
                      const t = c.text || l?.label;
                      if (!l?.href) {
                        return (
                          <span key={i} className="text-sm text-muted">
                            {t}
                          </span>
                        );
                      }
                      const isPromoRow = i < 2;
                      return (
                        <Button
                          key={i}
                          href={l.href}
                          target={l.target}
                          variant={ctaVariantAt(i, "brand", "ctaNavyDeep")}
                          ctaSize={isPromoRow ? "promo" : "default"}
                          ctaElevation={isPromoRow ? "none" : "default"}
                          className={
                            isPromoRow
                              ? "w-full !min-w-0 !max-w-full tracking-[0.5px] sm:w-[388px] sm:!max-w-[388px]"
                              : "h-12 w-full min-w-0 max-w-sm rounded-3xl sm:max-w-none"
                          }
                        >
                          {t}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
