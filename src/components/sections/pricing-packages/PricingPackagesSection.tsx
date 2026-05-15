import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { ctaVariantAt } from "@/lib/ui/ctaAlternation";
import { resolveLink } from "@/lib/utils/links";
import type { PricingPackagesSectionT } from "@/types/sections";
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
      <rect
        width="24"
        height="24"
        x="0"
        y="-0.5"
        rx="12"
        className="fill-brand"
      />
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
    <img
      src="/crown.svg"
      width={20}
      height={19}
      alt=""
      className="h-5 w-5 shrink-0 object-contain"
      aria-hidden
      decoding="async"
    />
  );
}

function PackageInclude({
  icon,
  text,
}: {
  icon: WpImage | null;
  text: string;
}) {
  return (
    <div className="flex min-h-[42px] items-center justify-start gap-1 rounded-[21px] bg-pill px-3 py-2 sm:min-h-[42px] sm:py-0">
      {icon ? (
        <div className="flex h-6 w-[27px] shrink-0 items-center justify-center">
          <Media
            image={icon}
            width={27}
            height={24}
            className="h-6 w-[27px] object-contain"
          />
        </div>
      ) : (
        <CheckIconFallback />
      )}
      <p className="min-w-0 font-sans text-[14px] font-normal leading-[1.6] tracking-[-0.28px] text-navy-deep">
        {text}
      </p>
    </div>
  );
}

export function PricingPackagesSection({
  section,
  lang,
}: {
  section: PricingPackagesSectionT;
  lang: Locale;
}) {
  return (
    <section className="bg-surface py-[72px] pb-[116px] sm:pt-[72px] sm:pb-[116px]">
      <Container className="!max-w-[85rem]">
        <div className="mx-auto flex max-w-[1300px] flex-col items-center gap-[44px]">
          <div
            className={`flex w-full max-w-[822px] flex-col items-center gap-5 text-center ${REVEAL_ITEM}`}
          >
            {section.eyebrow && (
              <div className="inline-flex h-[42px] min-w-[6.2rem] items-center justify-center rounded-[21px] bg-white px-3 font-sans text-[16px] font-medium leading-[1.6] text-brand">
                {section.eyebrow}
              </div>
            )}
            <div className="flex w-full flex-col items-center gap-[15px] text-center">
              {section.title && (
                <h2 className="max-w-[464px] font-sans text-3xl font-semibold leading-tight tracking-[-0.04em] text-navy sm:text-4xl sm:leading-tight lg:text-[48px] lg:leading-[56px] lg:tracking-[-0.04em]">
                  {section.title}
                </h2>
              )}
              {section.intro && (
                <RichText
                  html={section.intro}
                  className="w-full !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-center !prose-p:font-sans !prose-p:text-[16px] !prose-p:font-normal !prose-p:leading-[1.54] !prose-p:tracking-normal !prose-p:text-muted"
                />
              )}
            </div>
          </div>

          <div className="grid w-full max-w-[1300px] grid-cols-1 gap-6 sm:grid-cols-1 lg:grid-cols-2 lg:items-start lg:justify-center lg:gap-6">
            {section.items.map((p, i) => {
              const hasBadge = Boolean(p.badge);
              /** Figma: ribbon + border + navy CTA go together; badge without `featured` still gets chrome. */
              const showFeaturedChrome = p.featured || hasBadge;
              return (
                <div
                  key={i}
                  className={[
                    REVEAL_ITEM,
                    "relative box-border flex w-full min-w-0 max-w-[638px] flex-col rounded-[20px] bg-white p-12 font-sans sm:p-12 lg:justify-self-center",
                    showFeaturedChrome
                      ? "border border-solid border-brand"
                      : "border border-transparent shadow-md shadow-navy-deep/10",
                  ].join(" ")}
                >
                  {hasBadge && (
                    <div className="absolute -top-6 left-1/2 z-20 flex h-[47px] min-w-[169px] -translate-x-1/2 items-center justify-center gap-1.5 rounded-[15px] bg-brand px-4 font-sans text-[16px] font-normal leading-[1.6] text-white">
                      <CrownIcon />
                      {p.badge}
                    </div>
                  )}

                  <div
                    className={[
                      "flex w-full min-w-0 flex-col gap-6",
                      hasBadge ? "pt-4" : "pt-0",
                    ].join(" ")}
                  >
                    <div className="flex flex-col gap-3">
                      <h3 className="font-sans text-[24px] font-semibold leading-[1.1] text-navy-deep">
                        {p.title}
                      </h3>
                      {p.intro && (
                        <RichText
                          html={p.intro}
                          className="!prose-p:mt-0 !prose-p:max-w-full !prose-p:text-left !prose-p:font-sans !prose-p:text-[14px] !prose-p:font-normal !prose-p:leading-[1.6] !prose-p:tracking-[-0.28px] !prose-p:text-muted"
                        />
                      )}
                    </div>

                    <div
                      className="h-px w-full max-w-full bg-muted/20"
                      aria-hidden
                    />

                    {p.includes.length > 0 && (
                      <div className="flex w-full min-w-0 max-w-full flex-col gap-3 sm:max-w-full">
                        {p.includes.map((x, j) => (
                          <PackageInclude key={j} icon={x.icon} text={x.text} />
                        ))}
                      </div>
                    )}

                    {(p.pricingTitle ||
                      p.secondaryTitle ||
                      p.pricingParagraph) && (
                      <div className="flex w-full min-w-0 flex-col gap-5 text-left">
                        {(p.pricingTitle || p.secondaryTitle) && (
                          <div className="flex flex-col gap-[18px]">
                            {p.pricingTitle && (
                              <RichText
                                prose={false}
                                html={p.pricingTitle}
                                className={[
                                  "text-left font-sans text-[18px] font-bold leading-tight tracking-normal !text-accent",
                                  "[&_p]:!m-0 [&_p]:!max-w-full [&_p]:!text-left [&_p]:!font-sans [&_p]:!text-[18px] [&_p]:!font-bold [&_p]:!leading-tight [&_p]:!text-accent",
                                  "[&_h1]:!m-0 [&_h1]:!font-sans [&_h1]:!text-[18px] [&_h1]:!font-bold [&_h1]:!leading-tight [&_h1]:!text-accent",
                                  "[&_h2]:!m-0 [&_h2]:!font-sans [&_h2]:!text-[18px] [&_h2]:!font-bold [&_h2]:!leading-tight [&_h2]:!text-accent",
                                  "[&_h3]:!m-0 [&_h3]:!font-sans [&_h3]:!text-[18px] [&_h3]:!font-bold [&_h3]:!leading-tight [&_h3]:!text-accent",
                                  "[&_div]:!font-sans [&_div]:!text-[18px] [&_div]:!font-bold [&_div]:!leading-tight [&_div]:!text-accent",
                                  "[&_span]:!text-accent [&_li]:!text-accent [&_strong]:!font-bold [&_strong]:!text-accent",
                                  "[&_a]:!font-bold [&_a]:!text-brand",
                                ].join(" ")}
                              />
                            )}
                            {p.secondaryTitle && (
                              <RichText
                                prose={false}
                                html={p.secondaryTitle}
                                className={[
                                  "text-left font-sans text-[18px] font-bold leading-tight tracking-normal !text-navy-deep",
                                  "[&_p]:!m-0 [&_p]:!max-w-full [&_p]:!text-left [&_p]:!font-sans [&_p]:!text-[18px] [&_p]:!font-bold [&_p]:!leading-tight [&_p]:!text-navy-deep",
                                  "[&_h1]:!m-0 [&_h1]:!font-sans [&_h1]:!text-[18px] [&_h1]:!font-bold [&_h1]:!leading-tight [&_h1]:!text-navy-deep",
                                  "[&_h2]:!m-0 [&_h2]:!font-sans [&_h2]:!text-[18px] [&_h2]:!font-bold [&_h2]:!leading-tight [&_h2]:!text-navy-deep",
                                  "[&_h3]:!m-0 [&_h3]:!font-sans [&_h3]:!text-[18px] [&_h3]:!font-bold [&_h3]:!leading-tight [&_h3]:!text-navy-deep",
                                  "[&_div]:!font-sans [&_div]:!text-[18px] [&_div]:!font-bold [&_div]:!leading-tight [&_div]:!text-navy-deep",
                                  "[&_span]:!text-navy-deep [&_li]:!text-navy-deep [&_strong]:!font-bold [&_strong]:!text-navy-deep",
                                  "[&_a]:!font-bold [&_a]:!text-brand",
                                ].join(" ")}
                              />
                            )}
                          </div>
                        )}
                        {p.pricingParagraph && (
                          <RichText
                            prose={false}
                            html={p.pricingParagraph}
                            className={[
                              "text-left font-sans text-[16px] font-normal leading-[1.6] tracking-normal !text-navy-deep",
                              "[&_p]:!m-0 [&_p]:!max-w-full [&_p]:!text-left [&_p]:!font-sans [&_p]:!text-[16px] [&_p]:!font-normal [&_p]:!leading-[1.6] [&_p]:!text-navy-deep",
                              "[&_h1]:!m-0 [&_h1]:!font-sans [&_h1]:!text-[16px] [&_h1]:!font-normal [&_h1]:!text-navy-deep",
                              "[&_h2]:!m-0 [&_h2]:!font-sans [&_h2]:!text-[16px] [&_h2]:!font-normal [&_h2]:!text-navy-deep",
                              "[&_h3]:!m-0 [&_h3]:!font-sans [&_h3]:!text-[16px] [&_h3]:!font-normal [&_h3]:!text-navy-deep",
                              "[&_div]:!font-sans [&_div]:!text-[16px] [&_div]:!font-normal [&_div]:!text-navy-deep",
                              "[&_span]:!text-navy-deep [&_li]:!text-navy-deep [&_strong]:!font-semibold [&_strong]:!text-navy-deep",
                              "[&_a]:!font-medium [&_a]:!text-brand",
                            ].join(" ")}
                          />
                        )}
                      </div>
                    )}
                    <div className="flex w-full min-w-0 max-w-full flex-col gap-2 self-stretch">
                      {p.ctas.map((c, j) => {
                        const l = resolveLink(c.url, lang);
                        if (!l?.href) return null;
                        return (
                          <Button
                            key={j}
                            href={l.href}
                            target={l.target}
                            variant={
                              showFeaturedChrome ? "ctaNavyDeep" : "ctaBrand"
                            }
                            ctaSize="package"
                            ctaJustify="between"
                            ctaFullWidth={false}
                            className={[
                              "self-stretch !w-full min-[640px]:!w-auto min-[640px]:self-start font-sans text-[16px] leading-normal",
                              showFeaturedChrome ? "font-bold" : "font-medium",
                            ].join(" ")}
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
            <div
              className={`${REVEAL_ITEM} w-full max-w-[1000px] text-balance font-sans text-center text-navy-deep`}
            >
              <RichText
                html={section.bottomNote}
                className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:text-center !prose-p:font-sans !prose-p:text-[24px] !prose-p:font-semibold !prose-p:leading-[110%] !prose-p:not-italic !prose-p:text-navy-deep [&_p]:!m-0 [&_p]:!text-center [&_p]:!font-sans [&_p]:!text-[24px] [&_p]:!font-semibold [&_p]:!leading-[110%] [&_p]:!text-navy-deep [&_p]:!not-italic"
              />
            </div>
          )}

          {section.ctas.length > 0 && (
            <div
              className={`${REVEAL_ITEM} flex w-full max-w-full flex-col items-center justify-center gap-2.5 sm:max-w-[min(100%,800px)] sm:flex-row sm:flex-wrap sm:justify-center sm:gap-2.5 sm:pt-0`}
            >
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
                    ctaSize={i < 2 ? "promo" : "default"}
                    ctaJustify={i < 2 ? "between" : undefined}
                    ctaElevation={i === 1 ? "footerSecondary" : "default"}
                    className={
                      i < 2
                        ? [
                            "w-full min-w-0 max-w-full tracking-[0.5px]",
                            "sm:w-auto sm:max-w-none sm:shrink-0 sm:self-center sm:!px-10 md:!px-12 lg:!px-14",
                          ].join(" ")
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
