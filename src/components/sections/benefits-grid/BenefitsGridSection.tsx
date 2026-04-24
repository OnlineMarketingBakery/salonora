import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Media } from "@/components/ui/Media";
import { WhiteCtaLink } from "@/components/ui/WhiteCtaLink";
import { resolveLink } from "@/lib/utils/links";
import type { BenefitsGridSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

const gridStyle = {
  backgroundImage: `
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
  backgroundSize: "28px 28px",
} as const;

export function BenefitsGridSection({ section, lang }: { section: BenefitsGridSectionT; lang: Locale }) {
  const hasBanner = Boolean(
    section.bannerText || section.bannerLeftImage || section.bannerRightImage || section.ctas.length
  );

  return (
    <section className="relative overflow-hidden bg-navy-deep py-20 text-white sm:py-24 md:py-28">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_0%,rgba(57,144,240,0.2),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_100%_100%,rgba(5,105,215,0.16),transparent_50%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 opacity-35" style={gridStyle} aria-hidden />
      <Container>
        <div className="relative z-[1] flex w-full flex-col items-center gap-8">
          <div className="flex w-full max-w-[40.875rem] flex-col items-center gap-4 text-center">
            {section.eyebrow && (
              <p className="text-sm font-bold tracking-wide text-brand sm:text-base">{section.eyebrow}</p>
            )}
            {section.title && (
              <h2 className="text-3xl font-bold leading-tight tracking-[-0.04em] sm:text-4xl lg:text-[48px] lg:leading-[56px]">
                {section.title}
              </h2>
            )}
            {section.intro && (
              <RichText
                html={section.intro}
                className="w-full !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-center !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.4] !prose-p:text-white/95 first:prose-p:mt-0"
              />
            )}
          </div>
          {section.items.length > 0 && (
            <div className="grid w-full max-w-[80rem] grid-cols-1 items-stretch justify-items-center gap-6 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-5 lg:grid-cols-3">
              {section.items.map((b, i) => (
                <div
                  key={i}
                  className="box-border flex min-h-[153px] w-full max-w-[26.06rem] flex-col items-center justify-center rounded-[14px] bg-white p-8 text-center sm:p-[34px]"
                >
                  <div className="flex w-full min-w-0 max-w-sm flex-col items-center gap-4">
                    {b.icon && (
                      <div className="flex h-[39px] w-[39px] flex-shrink-0 items-center justify-center rounded-lg bg-brand p-1.5">
                        <Media
                          image={b.icon}
                          width={24}
                          height={24}
                          className="h-6 w-6 object-contain brightness-0 invert"
                        />
                      </div>
                    )}
                    {b.title && <p className="w-full min-w-0 text-base font-bold leading-[1.1] text-navy">{b.title}</p>}
                    {b.text && (
                      <RichText
                        html={b.text}
                        className="w-full text-sm !prose-p:mt-0 !prose-p:leading-relaxed !prose-p:text-muted"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {(section.urgencyText || hasBanner) && (
            <div className="mt-0 flex w-full max-w-[81.25rem] flex-col items-center gap-8 sm:gap-10">
              {section.urgencyText && (
                <div className="w-full text-balance sm:px-0">
                  <RichText
                    html={section.urgencyText}
                    className="!mx-auto !w-full !max-w-[50rem] !text-center !text-white !prose-p:!m-0 !prose-p:!text-center !prose-p:!text-2xl !prose-p:!font-bold !prose-p:!leading-[56px] !prose-p:!tracking-[-0.96px] !prose-p:!text-white [&>p]:!m-0 [&>p]:!text-center [&>p]:!text-2xl [&>p]:!font-bold [&>p]:!leading-[56px] [&>p]:!tracking-[-0.96px] [&>p]:!text-white [&_p]:!text-2xl [&_p]:!font-bold [&_p]:!leading-[56px] [&_p]:!tracking-[-0.96px] [&_p]:!text-center [&_b]:!text-white [&_b]:!font-bold [&_strong]:!text-white"
                  />
                </div>
              )}
              {hasBanner && (
                <div className="relative w-full max-w-[min(100%,1301px)] min-h-0 self-stretch">
                  {section.bannerLeftImage && (
                    <div className="pointer-events-none absolute bottom-0 left-0 z-20 hidden h-[180px] w-[140px] sm:block sm:h-[240px] sm:w-[200px] md:-left-2 md:h-[280px] md:w-[220px] lg:-left-4">
                      <Media
                        image={section.bannerLeftImage}
                        width={227}
                        height={297}
                        preferLargestSource
                        className="h-full w-full object-contain object-bottom"
                      />
                    </div>
                  )}
                  {section.bannerRightImage && (
                    <div className="pointer-events-none absolute bottom-0 right-0 z-20 hidden h-[180px] w-[150px] sm:block sm:h-[250px] sm:w-[200px] md:-right-2 md:h-[285px] md:w-[220px] lg:-right-4">
                      <Media
                        image={section.bannerRightImage}
                        width={239}
                        height={285}
                        preferLargestSource
                        className="h-full w-full object-contain object-bottom"
                      />
                    </div>
                  )}
                  <div
                    className="relative z-10 mx-auto flex w-full min-h-[12rem] flex-col items-center justify-center gap-5 rounded-[14px] border border-white/5 bg-gradient-to-b from-[#3990f0] to-[#0569d7] px-5 py-8 text-center sm:min-h-[249px] sm:px-10 sm:py-10 md:px-12"
                  >
                    {section.bannerText && (
                      <RichText
                        html={section.bannerText}
                        className="!mx-auto max-w-[64rem] !text-center !text-white !prose-p:!m-0 !prose-p:!text-center !prose-p:!text-2xl !prose-p:!font-medium !prose-p:!leading-[37px] !prose-p:!tracking-[-0.96px] !prose-p:!text-white [&>p]:!text-center [&>p]:!text-2xl [&>p]:!font-medium [&>p]:!leading-[37px] [&>p]:!tracking-[-0.96px] [&>p]:!text-white [&_p]:!text-2xl [&_p]:!font-medium [&_p]:!leading-[37px] [&_p]:!tracking-[-0.96px] [&_p]:!text-center [&_b]:!font-bold [&_strong]:!text-white/95"
                      />
                    )}
                    {section.ctas.length > 0 && (
                      <div className="flex w-full flex-col items-center justify-center gap-3">
                        {section.ctas.map((c, i) => {
                          const l = resolveLink(c.url, lang);
                          if (!c.text && !l) return null;
                          if (!l?.href) return null;
                          return (
                            <WhiteCtaLink key={i} href={l.href} target={l.target} className="!w-auto min-w-0 sm:px-2">
                              {c.text || l?.label}
                            </WhiteCtaLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
