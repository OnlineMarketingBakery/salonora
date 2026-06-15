import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { formatHeadingLines } from "@/lib/i18n/format-heading";
import { SITE_CONTENT_WIDTH_STEPS_FRAME } from "@/lib/layout/site-content-width";
import { SECTION_SHELL_SURFACE } from "@/lib/layout/section-spacing";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { ctaVariantAt } from "@/lib/ui/ctaAlternation";
import { resolveLink } from "@/lib/utils/links";
import type {
  HowItWorksStepsIconAccentT,
  HowItWorksStepsSectionT,
  HowItWorksStepsStepItemT,
} from "@/types/sections";
import { Fragment, type CSSProperties } from "react";

/** Figma 346:6584 â€” full-width frame, fixed height, horizontal padding only (border drawn by overlay) */
const STEPS_FRAME_CLASS =
  "relative w-full rounded-[24px] pl-5 pr-[21px] max-md:py-5 md:h-[297px]";

/** Figma 346:6585 â€” columns fill the frame evenly, bottom-aligned, full-height dividers */
const STEPS_ROW_CLASS =
  "flex w-full flex-col gap-5 md:h-full md:flex-row md:items-end md:gap-5";

/**
 * Figma 346:6584 stroke â€” 1px linear gradient border (brand #3990F0 â†’ surface #EBF3FE)
 * at 50% opacity, masked so it follows the rounded corners and leaves the fill transparent.
 */
const STEPS_BORDER_STYLE: CSSProperties = {
  padding: 1,
  background:
    "linear-gradient(180deg, var(--palette-brand) 0%, var(--palette-surface) 100%)",
  opacity: 0.5,
  WebkitMask:
    "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
  WebkitMaskComposite: "xor",
  maskComposite: "exclude",
};

/**
 * Figma 346:6593 â€” 1px divider with a vertical gradient from brand (top) to
 * surface #EBF3FE (bottom) at 50% opacity, spanning the full frame height.
 */
function StepDivider() {
  return (
    <div
      className="hidden w-px shrink-0 self-stretch bg-[linear-gradient(180deg,var(--palette-brand)_0%,var(--palette-surface)_100%)] opacity-50 md:block"
      aria-hidden
    />
  );
}

/** Figma icon wells: brand `#398ce9`, rose `#d27e91` */
function iconTileBackground(
  accent: HowItWorksStepsIconAccentT | undefined,
): CSSProperties {
  const a = accent ?? "brand";
  return {
    backgroundColor:
      a === "rose" ? "var(--palette-rose)" : "var(--palette-brand-soft)",
  };
}

const stepDescProse = [
  "!prose-p:mb-0 !prose-p:mt-0",
  "!prose-p:max-w-none",
  "!prose-p:text-center",
  "!prose-p:font-sans",
  "!prose-p:text-[14px]",
  "!prose-p:font-normal",
  "!prose-p:leading-[1.6]",
  "!prose-p:text-muted",
  "[&_a]:text-brand",
].join(" ");

function StepCard({ step }: { step: HowItWorksStepsStepItemT }) {
  const hasContent =
    Boolean(step.icon) ||
    Boolean(step.title?.trim()) ||
    Boolean(step.description?.trim());
  if (!hasContent) return null;

  return (
    <article
      className={`${REVEAL_ITEM} flex w-full flex-col items-center justify-center gap-5 rounded-[17px] bg-linear-to-b from-white to-surface p-6 text-center sm:p-[34px] md:h-[282px] md:min-w-0 md:flex-1 md:basis-0`}
    >
      {step.icon ? (
        <div className="flex size-[62px] shrink-0 items-center justify-center overflow-hidden rounded-[10px]">
          <Media
            image={step.icon}
            width={62}
            height={62}
            className="size-[62px] object-cover"
            sizes="62px"
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
        <h3 className="w-full max-w-[307px] text-2xl font-bold leading-[1.1] text-navy-deep">
          {step.title}
        </h3>
      ) : null}
      {step.description ? (
        <RichText
          html={step.description}
          className={`${stepDescProse} w-full max-w-[323px] shrink-0`}
        />
      ) : null}
    </article>
  );
}

function StepsFrame({ steps }: { steps: HowItWorksStepsStepItemT[] }) {
  if (steps.length === 0) return null;

  return (
    <div className={`${REVEAL_ITEM} ${STEPS_FRAME_CLASS}`}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[24px]"
        style={STEPS_BORDER_STYLE}
      />
      <div className={STEPS_ROW_CLASS}>
        {steps.map((step, i) => (
          <Fragment key={i}>
            {i > 0 ? <StepDivider /> : null}
            <StepCard step={step} />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export function HowItWorksStepsSection({
  section,
  lang,
}: {
  section: HowItWorksStepsSectionT;
  lang: Locale;
}) {
  const titleLines = formatHeadingLines(section.title ?? "");

  const steps = section.steps ?? [];
  const ctas = section.ctas ?? [];

  return (
    <section className={`bg-surface ${SECTION_SHELL_SURFACE}`}>
      <Container>
        <div className={`mx-auto flex w-full ${SITE_CONTENT_WIDTH_STEPS_FRAME} flex-col items-center gap-[30px]`}>
          <div className="flex w-full flex-col items-center gap-7">
            <header
              className={`${REVEAL_ITEM} flex w-full max-w-[417px] flex-col items-center gap-6 text-center`}
            >
              {section.badge ? (
                <span className="inline-flex h-[42px] w-fit max-w-full items-center rounded-[21px] bg-brand/10 px-[18px] py-3 text-base font-bold leading-[1.6] text-brand">
                  {section.badge}
                </span>
              ) : null}
              {titleLines.length > 0 ? (
                <h2 className="font-sans text-[32px] font-bold leading-tight text-navy-deep sm:text-[40px] sm:leading-[1.15] lg:text-[48px] lg:leading-[56px]">
                  {titleLines.map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
                </h2>
              ) : null}
            </header>

            <StepsFrame steps={steps} />
          </div>

          {ctas.length > 0 ? (
            <div
              className={`${REVEAL_ITEM} flex w-full flex-col items-center gap-[14px] sm:flex-row sm:items-center sm:justify-center sm:gap-[14px]`}
            >
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
                    ctaFullWidth={false}
                    className={
                      v === "ctaBrand"
                        ? "shrink-0 rounded-[24px] border border-white text-white shadow-[0px_6px_10px_rgba(57,144,240,0.54)]"
                        : "w-fit max-w-full text-lg leading-6"
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
              className={`${REVEAL_ITEM} max-w-[956px] text-center text-xl font-bold leading-[1.22] text-accent sm:text-2xl`}
            >
              {section.footerTagline}
            </p>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
