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

function iconTileBackground(accent: HowItWorksStepsIconAccentT | undefined): CSSProperties {
  const a = accent ?? "brand";
  return {
    backgroundColor: a === "rose" ? "var(--palette-rose-soft)" : "var(--palette-brand)",
  };
}

const stepDescProse = [
  "!prose-p:mb-0 !prose-p:mt-0",
  "!prose-p:max-w-none",
  "!prose-p:text-center",
  "!prose-p:font-sans",
  "!prose-p:text-base",
  "!prose-p:font-normal",
  "!prose-p:leading-snug",
  "!prose-p:text-muted",
  "[&_a]:text-brand",
].join(" ");

function StepCard({ step }: { step: HowItWorksStepsStepItemT }) {
  const hasContent =
    Boolean(step.icon) || Boolean(step.title?.trim()) || Boolean(step.description?.trim());
  if (!hasContent) return null;

  return (
    <article
      className={`${REVEAL_ITEM} flex min-h-64 w-full max-w-xs flex-col items-center gap-6 rounded-2xl bg-white px-6 py-9 text-center shadow-none ring-1 ring-brand/10 sm:max-w-sm sm:px-8 sm:py-10 lg:max-w-none`}
    >
      {step.icon ? (
        <div
          className="flex size-14 shrink-0 items-center justify-center rounded-xl p-3"
          style={iconTileBackground(step.iconAccent)}
        >
          <Media
            image={step.icon}
            width={56}
            height={56}
            className="size-8 object-contain brightness-0 invert"
            sizes="48px"
            preferLargestSource
          />
        </div>
      ) : (
        <div
          className="size-14 shrink-0 rounded-xl"
          style={iconTileBackground(step.iconAccent)}
          aria-hidden
        />
      )}
      {step.title ? (
        <h3 className="text-xl font-semibold leading-tight tracking-tight text-navy sm:text-2xl">{step.title}</h3>
      ) : null}
      {step.description ? (
        <RichText html={step.description} className={`${stepDescProse} w-full shrink-0`} />
      ) : null}
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
      <Container className="!max-w-7xl">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-10">
          <header className={`${REVEAL_ITEM} flex w-full flex-col items-center gap-4 text-center`}>
            {section.badge ? (
              <span className="inline-flex w-fit max-w-full items-center rounded-full bg-brand/10 px-5 py-2.5 text-base font-medium leading-tight text-brand">
                {section.badge}
              </span>
            ) : null}
            {titleLines.length > 0 ? (
              <h2 className="font-sans text-3xl font-semibold leading-tight tracking-tighter text-navy sm:text-4xl md:text-5xl">
                {titleLines.map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            ) : null}
          </header>

          {steps.length > 0 ? (
            <div className="w-full max-w-5xl rounded-3xl border-2 border-brand/20 bg-white p-6 shadow-sm sm:p-8 md:p-10">
              <div className="grid w-full gap-8 md:grid-cols-3 md:gap-6 lg:gap-8">
                {steps.map((step, i) => (
                  <StepCard key={i} step={step} />
                ))}
              </div>
            </div>
          ) : null}

          {ctas.length > 0 ? (
            <div className={`${REVEAL_ITEM} flex w-full max-w-md flex-col items-stretch gap-4`}>
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
                    ctaSize="promo"
                    ctaElevation={v === "ctaBrand" ? "default" : "none"}
                    ctaJustify="between"
                    arrowClassName="size-6 shrink-0"
                    className={
                      v === "ctaBrand"
                        ? "w-full !max-w-none !gap-2 !text-lg !leading-6 sm:!gap-8"
                        : "w-full min-w-0 max-w-full gap-4 !text-lg !leading-6"
                    }
                  >
                    {t}
                  </Button>
                );
              })}
            </div>
          ) : null}

          {section.footerTagline ? (
            <p className={`${REVEAL_ITEM} text-center text-base font-normal leading-relaxed text-navy`}>
              {section.footerTagline}
            </p>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
