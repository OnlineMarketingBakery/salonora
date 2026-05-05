import { Fragment } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { resolveLink } from "@/lib/utils/links";
import { ctaVariantAt } from "@/lib/ui/ctaAlternation";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { CSSProperties } from "react";
import type {
  HowItWorksStepsIconAccentT,
  HowItWorksStepsSectionT,
  HowItWorksStepsStepItemT,
} from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

/** Figma frame stroke: linear brand → surface, stroke opacity 50%, inside, 1px (via padded gradient wrapper). */
const stepsFrameChrome: CSSProperties = {
  backgroundImage:
    "linear-gradient(to bottom, color-mix(in srgb, var(--palette-brand) 50%, transparent), color-mix(in srgb, var(--palette-surface) 50%, transparent))",
};

/** Figma icon wells: brand `#398ce9`, rose `#d27e91` — align with CSS palette tokens */
function iconTileBackground(accent: HowItWorksStepsIconAccentT | undefined): CSSProperties {
  const a = accent ?? "brand";
  return {
    backgroundColor: a === "rose" ? "var(--palette-rose)" : "var(--palette-brand-soft)",
  };
}

const stepDescProse = [
  "!prose-p:mb-0 !prose-p:mt-0",
  "!prose-p:max-w-none",
  "!prose-p:text-center",
  "!prose-p:font-sans",
  "!prose-p:text-sm",
  "!prose-p:font-normal",
  "!prose-p:leading-relaxed",
  "!prose-p:text-muted",
  "[&_a]:text-brand",
].join(" ");

function StepCard({ step }: { step: HowItWorksStepsStepItemT }) {
  const hasContent =
    Boolean(step.icon) || Boolean(step.title?.trim()) || Boolean(step.description?.trim());
  if (!hasContent) return null;

  return (
    <article
      className={`${REVEAL_ITEM} flex min-h-0 w-full max-w-full shrink-0 flex-col items-center gap-5 rounded-2xl bg-linear-to-b from-white to-surface p-8 text-center md:h-[282px] md:min-h-[282px] md:w-[375px] md:max-w-[375px]`}
    >
      <div className="flex w-full flex-col items-center gap-5">
        {step.icon ? (
          <div
            className="flex size-[62px] shrink-0 items-center justify-center rounded-[10px] p-4"
            style={iconTileBackground(step.iconAccent)}
          >
            <Media
              image={step.icon}
              width={60}
              height={60}
              className="size-[30px] object-contain brightness-0 invert"
              sizes="30px"
              preferLargestSource
            />
          </div>
        ) : (
          <div
            className="size-[62px] shrink-0 rounded-[10px] p-4"
            style={iconTileBackground(step.iconAccent)}
            aria-hidden
          />
        )}
        {step.title ? (
          <h3 className="w-full max-w-76 text-2xl font-bold leading-[1.1] tracking-tight text-navy-deep">
            {step.title}
          </h3>
        ) : null}
        {step.description ? (
          <RichText html={step.description} className={`${stepDescProse} w-full max-w-none shrink-0`} />
        ) : null}
      </div>
    </article>
  );
}

export function HowItWorksStepsSection({ section, lang }: { section: HowItWorksStepsSectionT; lang: Locale }) {
  const titleLines = (section.title ?? "")
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const steps = section.steps ?? [];
  const ctas = section.ctas ?? [];

  return (
    <section className="bg-surface py-16 sm:py-20 md:py-24">
      <Container className="max-w-7xl!">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-[30px]">
          <header className={`${REVEAL_ITEM} flex w-full max-w-[417px] flex-col items-center gap-6 text-center`}>
            {section.badge ? (
              <span className="inline-flex h-[42px] w-fit max-w-full items-center rounded-[21px] bg-brand/10 px-[18px] py-3 text-base font-bold leading-relaxed text-brand">
                {section.badge}
              </span>
            ) : null}
            {titleLines.length > 0 ? (
              <h2 className="font-sans text-5xl font-bold leading-[56px] tracking-tighter text-navy-deep">
                {titleLines.map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            ) : null}
          </header>

          {steps.length > 0 ? (
            <div
              className="w-full rounded-[24px] p-px md:box-border md:flex md:h-[297px] md:flex-col md:overflow-hidden"
              style={stepsFrameChrome}
            >
              <div className="flex min-h-0 w-full flex-1 flex-col items-stretch gap-8 rounded-[23px] bg-surface px-5 py-5 md:flex-row md:items-end md:justify-center md:gap-5 md:py-0 md:pl-5 md:pr-[21px]">
                {steps.map((step, i) => (
                  <Fragment key={i}>
                    {i > 0 ? (
                      <div
                        className="hidden w-px shrink-0 bg-brand/35 md:block md:h-[295px]"
                        aria-hidden
                      />
                    ) : null}
                    <StepCard step={step} />
                  </Fragment>
                ))}
              </div>
            </div>
          ) : null}

          {ctas.length > 0 ? (
            <div className={`${REVEAL_ITEM} flex w-full flex-col items-center gap-4`}>
              {ctas.map((c, i) => {
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
                    ctaSize="compact"
                    ctaElevation="none"
                    ctaJustify="between"
                    ctaFullWidth={false}
                    arrowClassName="size-6 shrink-0"
                    className={
                      v === "ctaBrand"
                        ? "h-12 min-h-12 w-[196px] shrink-0 gap-2 rounded-3xl border border-white px-3.5 text-base font-medium leading-normal! text-white shadow-[0px_6px_10px_rgba(57,144,240,0.54)] sm:pl-[17px] sm:pr-3"
                        : "w-fit max-w-full gap-4 text-lg leading-6"
                    }
                  >
                    {t}
                  </Button>
                );
              })}
            </div>
          ) : null}

          {section.footerTagline ? (
            <p
              className={`${REVEAL_ITEM} max-w-[956px] text-center text-2xl font-bold leading-snug text-accent`}
            >
              {section.footerTagline}
            </p>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
