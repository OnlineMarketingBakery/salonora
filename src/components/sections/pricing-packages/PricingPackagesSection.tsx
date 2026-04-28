import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Media } from "@/components/ui/Media";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
import { ctaVariantAt } from "@/lib/ui/ctaAlternation";
import type { PricingPackagesSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";
import type { WpImage } from "@/types/wordpress";

function CheckIconFallback() {
  return (
    <svg
      className="h-6 w-[27px] shrink-0"
      viewBox="0 0 27 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="24" height="24" x="0" y="-0.5" rx="12" className="fill-[#3990F0]" />
      <path
        d="M6 11.5l4 4 8-8"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-white" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5L6.5 8.5L10 3.5L12.5 6.5L15 3.5L18.5 8.5L21 10.5L19.5 20H4.5L4 10.5Z"
        fill="currentColor"
        fillOpacity="0.95"
      />
    </svg>
  );
}

function PackageInclude({ icon, text }: { icon: WpImage | null; text: string }) {
  return (
    <div className="flex w-full min-h-[42px] items-center justify-start gap-1.5 rounded-[21px] bg-pill py-0 pl-3 pr-2.5">
      {icon ? (
        <div className="flex h-6 w-[27px] shrink-0 items-center justify-center">
          <Media image={icon} width={27} height={24} className="h-6 w-[27px] object-contain" />
        </div>
      ) : (
        <CheckIconFallback />
      )}
      <p className="min-w-0 text-sm font-normal leading-[1.6] text-navy-deep">{text}</p>
    </div>
  );
}

export function PricingPackagesSection({ section, lang }: { section: PricingPackagesSectionT; lang: Locale }) {
  return (
    <section className="bg-surface py-[72px] pb-[116px] sm:pt-[72px] sm:pb-[116px]">
      <Container className="!max-w-[85rem]">
        <div className="mx-auto flex max-w-[1300px] flex-col items-center gap-10 sm:gap-12 lg:gap-[64px]">
          <div className="flex max-w-[634px] flex-col items-center gap-5 text-center sm:gap-5">
            {section.eyebrow && (
              <div className="inline-flex h-[42px] min-w-[6.2rem] items-center justify-center rounded-full bg-white px-6 text-base font-normal leading-[1.6] text-brand shadow-sm">
                {section.eyebrow}
              </div>
            )}
            {section.title && (
              <h2 className="text-3xl font-semibold leading-tight tracking-[-0.04em] text-navy sm:text-4xl sm:leading-tight lg:text-[48px] lg:leading-[56px] lg:tracking-[-0.04em]">
                {section.title}
              </h2>
            )}
            {section.intro && (
              <RichText
                html={section.intro}
                className="w-full !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-center !prose-p:text-sm !prose-p:leading-normal !prose-p:text-muted"
              />
            )}
          </div>

          <div className="grid w-full max-w-[1300px] grid-cols-1 gap-6 sm:grid-cols-1 lg:grid-cols-2 lg:items-start lg:justify-center lg:gap-6">
            {section.items.map((p, i) => {
              const hasBadge = Boolean(p.badge);
              return (
                <div
                  key={i}
                  className={[
                    "relative box-border flex h-full w-full min-w-0 max-w-[638px] flex-col justify-between rounded-[20px] bg-white p-10 sm:p-10 lg:justify-self-center",
                    p.featured ? "border-2 border-brand" : "border-0",
                  ].join(" ")}
                >
                  {hasBadge && (
                    <div className="absolute -top-3 left-1/2 z-20 flex h-[47px] min-w-[169px] -translate-x-1/2 items-center justify-center gap-1.5 rounded-[15px] bg-brand px-4 text-base font-normal text-white">
                      <CrownIcon />
                      {p.badge}
                    </div>
                  )}

                  <div
                    className={[
                      "mt-0 flex w-full min-w-0 flex-col items-stretch gap-[18px]",
                      hasBadge ? "pt-4" : "pt-0",
                    ].join(" ")}
                  >
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-4 sm:gap-4">
                        <h3
                          className="text-2xl font-semibold leading-[1.1] text-navy-deep"
                          // #002752
                        >
                          {p.title}
                        </h3>
                        {p.intro && (
                          <RichText
                            html={p.intro}
                            className="!prose-p:mt-0 !prose-p:max-w-full !prose-p:text-left !prose-p:text-sm !prose-p:font-normal !prose-p:leading-[1.6] !prose-p:tracking-[-0.28px] !prose-p:text-muted"
                          />
                        )}
                      </div>

                      <div className="h-px w-full max-w-full bg-surface/60" aria-hidden />

                      {p.includes.length > 0 && (
                        <div className="flex w-full min-w-0 max-w-full flex-col gap-4 sm:max-w-full">
                          <p className="text-xl font-semibold leading-[1.6] tracking-[-0.4px] text-navy-deep">
                            Wat je krijgt:
                          </p>
                          <div className="flex w-full min-w-0 max-w-full flex-col gap-3">
                            {p.includes.map((x, j) => (
                              <PackageInclude key={j} icon={x.icon} text={x.text} />
                            ))}
                          </div>
                        </div>
                      )}

                      {(p.solvesTitle || p.solvesItems.length > 0) && (
                        <div className="w-full min-w-0 max-w-full rounded-[12px] bg-pill p-5 sm:max-w-full sm:min-h-[7.5rem] sm:p-6">
                          {p.solvesTitle && (
                            <RichText
                              html={p.solvesTitle}
                              className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-full !prose-p:text-left !prose-p:text-xl !prose-p:font-semibold !prose-p:leading-[1.6] !prose-p:tracking-[-0.4px] !prose-p:text-navy-deep"
                            />
                          )}
                          {p.solvesItems.length > 0 && (
                            <ul
                              className="mt-1.5 w-full list-disc pl-[1.3rem] text-left text-sm font-normal leading-[1.8] tracking-[-0.28px] text-muted marker:text-navy/30"
                            >
                              {p.solvesItems.map((s, j) => (
                                <li key={j} className="[&:not(:last-child)]:mb-0.5 [padding-start:0.2rem]">
                                  {s.text}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      {p.priceLine && (
                        <div className="w-full min-w-0 text-base">
                          <RichText
                            html={p.priceLine}
                            className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-full !prose-p:text-left !prose-p:font-semibold !prose-p:leading-[1.22] !prose-p:text-[#1d5898] [&_a]:!text-brand [&_a]:!font-semibold"
                          />
                        </div>
                      )}

                      {p.note && (
                        <div className="w-full min-w-0 text-base text-navy-deep">
                          <RichText
                            html={p.note}
                            className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-full !prose-p:font-semibold !prose-p:leading-[1.6] !prose-p:tracking-[-0.4px] !prose-p:text-navy-deep"
                          />
                        </div>
                      )}

                      {p.smallPrint && <p className="text-sm font-normal leading-[1.6] text-navy-deep">{p.smallPrint}</p>}
                    </div>

                    <div className="mt-0 flex w-full min-w-0 max-w-full flex-col gap-2">
                      {p.ctas.map((c, j) => {
                        const l = resolveLink(c.url, lang);
                        if (!l?.href) return null;
                        if (p.featured) {
                          return (
                            <Button
                              key={j}
                              href={l.href}
                              target={l.target}
                              variant="ctaNavy"
                              ctaSize="package"
                              className="max-w-[332px] self-start py-0 pl-[18px] pr-3 leading-[normal]"
                            >
                              {c.text || l.label}
                            </Button>
                          );
                        }
                        return (
                          <Button
                            key={j}
                            href={l.href}
                            target={l.target}
                            variant="ctaBrand"
                            ctaSize="package"
                            className="!max-w-[16rem] !gap-2 !px-4"
                          >
                            {c.text || l.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {section.bottomNote && (
            <div className="w-full max-w-[1000px] text-balance font-sans text-center text-[#002752]">
              <RichText
                html={section.bottomNote}
                className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:text-center !prose-p:text-[24px] !prose-p:font-semibold !prose-p:leading-[110%] !prose-p:not-italic !prose-p:text-[#002752] [&_p]:!m-0 [&_p]:!text-center [&_p]:!text-[24px] [&_p]:!font-semibold [&_p]:!leading-[110%] [&_p]:!text-[#002752] [&_p]:!not-italic"
              />
            </div>
          )}

          {section.ctas.length > 0 && (
            <div className="flex w-full max-w-full flex-col items-stretch justify-center gap-2.5 sm:max-w-[min(100%,800px)] sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-2.5 sm:pt-0">
              {section.ctas.map((c, i) => {
                const l = resolveLink(c.url, lang);
                if (!l?.href) return null;
                const t = c.text || l.label;
                const v = ctaVariantAt(i);
                return (
                  <Button
                    key={i}
                    href={l.href}
                    target={l.target}
                    variant={v}
                    ctaSize={i < 2 ? "hero" : "default"}
                    ctaElevation={i === 1 ? "footerSecondary" : "default"}
                    className={
                      i < 2
                        ? "!h-12 !max-h-12 w-full !max-w-[321px] !px-4 !text-lg !font-normal !leading-6"
                        : "h-12 w-full min-w-0 max-w-md rounded-3xl"
                    }
                  >
                    {t}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
