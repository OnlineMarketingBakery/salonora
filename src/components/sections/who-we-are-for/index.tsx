import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { WhoWeAreForItemAccentT, WhoWeAreForSectionT } from "@/types/sections";

function iconTileClass(accent: WhoWeAreForItemAccentT): string {
  return accent === "rose"
    ? "bg-[var(--palette-rose-soft)]"
    : "bg-[var(--palette-brand-soft)]";
}

export function WhoWeAreForSection({
  section,
  lang,
}: {
  section: WhoWeAreForSectionT;
  lang: Locale;
}) {
  const primaryCta = section.ctas[0];
  const resolvedCta = primaryCta ? resolveLink(primaryCta.url, lang) : null;
  const ctaLabel = primaryCta?.text?.trim() || resolvedCta?.label?.trim() || "";

  return (
    <section lang={lang} className="bg-[var(--palette-white)] py-16 md:py-24">
      <Container className="!max-w-[85rem]">
        <div
          className={`${REVEAL_ITEM} mx-auto flex w-full max-w-[81.375rem] flex-col items-center gap-10 md:gap-[52px]`}
        >
          {section.title ? (
            <RichText
              html={section.title}
              className="text-center font-sans text-[clamp(1.75rem,4.2vw,3rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-[var(--palette-navy)] [&_*]:text-[var(--palette-navy)] [&_p]:mb-0 [&_p]:mt-0 [&_p+p]:mt-2 prose-headings:text-[var(--palette-navy)] prose-strong:text-[var(--palette-navy)]"
            />
          ) : null}

          <div className="flex w-full flex-wrap justify-center gap-4 sm:gap-5 md:gap-5">
            {section.items.map((item, index) => (
              <div
                key={`${section.id}-item-${index}`}
                className="flex h-[min(227px,58vw)] w-[min(245px,46vw)] shrink-0 flex-col items-center justify-center rounded-[200px] bg-[linear-gradient(180deg,var(--palette-surface)_0%,var(--palette-white)_100%)] px-4 py-6 sm:h-[227px] sm:w-[244px] sm:max-w-[245px] md:px-6"
              >
                <div className="flex max-w-[10rem] flex-col items-center gap-5 sm:max-w-none sm:gap-[30px]">
                  <div
                    className={`flex size-[57px] shrink-0 items-center justify-center rounded-[12px] ${iconTileClass(item.icon_accent)}`}
                  >
                    {item.icon ? (
                      <Media
                        image={item.icon}
                        width={40}
                        height={40}
                        className="h-7 w-7 object-contain sm:h-8 sm:w-8"
                        sizes="40px"
                        preferLargestSource
                      />
                    ) : null}
                  </div>
                  {item.label ? (
                    <RichText
                      html={item.label}
                      className="w-full text-center font-sans text-lg font-medium leading-[1.1] text-[var(--palette-navy)] sm:text-2xl [&_*]:text-[var(--palette-navy)] [&_p]:mb-0 [&_p]:mt-0 [&_p+p]:mt-1"
                    />
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {resolvedCta?.href && ctaLabel ? (
            <Button
              href={resolvedCta.href}
              target={resolvedCta.target}
              variant="ctaBrand"
              ctaSize="compact"
              className="mt-2"
            >
              {ctaLabel}
            </Button>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
