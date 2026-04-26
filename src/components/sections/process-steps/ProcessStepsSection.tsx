import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Button } from "@/components/ui/Button";
import { PrimaryCtaLink } from "@/components/ui/PrimaryCtaLink";
import { ArrowInCircle } from "@/components/ui/ArrowInCircle";
import { resolveLink } from "@/lib/utils/links";
import type { ProcessStepsSectionT, ProcessStepItemT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

const gridStyle = {
  backgroundImage: `
    linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)`,
  backgroundSize: "32px 32px",
} as const;

const stepProseOnDark = [
  "!prose-p:mb-0 !prose-p:mt-0",
  "!prose-p:max-w-none",
  "!prose-p:text-center",
  "!prose-p:font-sans",
  "!prose-p:text-base",
  "!prose-p:font-normal",
  "!prose-p:leading-[1.4]",
  "!prose-p:text-white",
  "[&_a]:text-white/90",
].join(" ");

const stepProseOnCard = [
  "!prose-p:mb-0 !prose-p:mt-0",
  "!prose-p:max-w-none",
  "!prose-p:text-center",
  "!prose-p:font-sans",
  "!prose-p:text-base",
  "!prose-p:font-normal",
  "!prose-p:leading-[1.4]",
  "!prose-p:text-navy",
  "[&_a]:!text-navy",
].join(" ");

function NumberBadge({ n }: { n: string }) {
  return (
    <div className="flex size-[86px] shrink-0 items-center justify-center rounded-[24px] bg-brand">
      <span className="text-[48px] font-semibold leading-[56px] tracking-[-0.04em] text-white">{n}</span>
    </div>
  );
}

function ProcessStepBlock({ s, maxWidthClass }: { s: ProcessStepItemT; maxWidthClass: string }) {
  if (s.highlight) {
    return (
      <div
        className={[
          "box-border flex w-full max-w-[383px] min-h-[240px] flex-col items-stretch justify-between gap-0 rounded-[12px] bg-white p-[30px] sm:min-h-[275px] lg:min-h-[275px]",
          maxWidthClass,
        ].join(" ")}
      >
        <div className="flex w-full min-w-0 max-w-[267px] flex-col items-center gap-3 self-center">
          <div className="flex h-[136px] w-full max-w-[197px] flex-col items-center justify-center gap-6 self-center">
            <NumberBadge n={s.number} />
            {s.title && <h3 className="w-full min-w-0 text-center text-2xl font-semibold leading-[1.1] tracking-[-0.04em] text-navy">{s.title}</h3>}
          </div>
        </div>
        {s.text && <RichText html={s.text} className={`${stepProseOnCard} w-full shrink-0`} />}
      </div>
    );
  }
  return (
    <div className={["flex w-full flex-col items-center gap-3 text-center", maxWidthClass].filter(Boolean).join(" ")}>
      <div className="flex w-full min-w-0 max-w-[197px] flex-col items-center justify-center gap-6">
        <NumberBadge n={s.number} />
        {s.title && <h3 className="w-full min-w-0 text-center text-2xl font-semibold leading-[1.1] tracking-[-0.04em] text-white">{s.title}</h3>}
      </div>
      {s.text && <RichText html={s.text} className={stepProseOnDark} />}
    </div>
  );
}

/** Figma: side columns ~317 / ~291, center 383. Map by index for consistent layout with 3 steps. */
function getStepWidthClass(i: number): string {
  if (i === 0) return "max-w-[min(100%,20rem)] lg:max-w-[317px]"; // 320px
  if (i === 2) return "max-w-[min(100%,20rem)] lg:max-w-[291px]";
  return "";
}

export function ProcessStepsSection({ section, lang }: { section: ProcessStepsSectionT; lang: Locale }) {
  const titleLines = section.title
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <section className="relative overflow-hidden bg-navy-deep pb-8 pt-20 text-white sm:pb-10 sm:pt-24 md:pt-32 lg:pb-10 lg:pt-[100px] xl:pt-[140px]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 0% 0%, rgba(57,144,240,0.20) 0%, transparent 55%), radial-gradient(ellipse 50% 45% at 100% 100%, rgba(57,144,240,0.16) 0%, transparent 55%)",
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 opacity-40" style={gridStyle} aria-hidden />
      <Container className="relative z-[1] !max-w-[85rem]">
        <div className="mx-auto flex w-full max-w-[1087px] flex-col items-center gap-8 md:gap-[34px]">
          {titleLines.length > 0 && (
            <h2 className="w-full text-center text-[40px] font-semibold leading-tight tracking-[-0.04em] sm:text-[48px] sm:leading-[56px]">
              {titleLines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h2>
          )}

          {section.intro && (
            <div className="w-full text-center text-base leading-normal text-white/90 [&_.prose-p]:text-inherit">
              <RichText html={section.intro} className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:text-center !prose-p:leading-[1.5] !prose-p:text-white/90" />
            </div>
          )}

          <div className="mt-0 flex w-full flex-col items-center justify-center gap-8 lg:mt-0 lg:flex-row lg:items-center lg:gap-12">
            {section.items.map((s, i) => {
              if (s.highlight) {
                return <ProcessStepBlock key={i} s={s} maxWidthClass="w-full" />;
              }
              return <ProcessStepBlock key={i} s={s} maxWidthClass={getStepWidthClass(i)} />;
            })}
          </div>

          <div className="flex w-full max-w-[505px] flex-col items-center gap-8 md:gap-[34px]">
            {section.smallText && (
              <p className="w-full text-center text-2xl font-semibold leading-[1.22] text-white [text-wrap:balance]">
                {section.smallText}
              </p>
            )}

            {section.ctas.length > 0 && (
              <div className="flex w-full flex-col items-stretch gap-[17px]">
                {section.ctas.map((c, i) => {
                  const l = resolveLink(c.url, lang);
                  if (!l?.href) return null;
                  const t = c.text || l?.label;
                  if (i === 0) {
                    return (
                      <PrimaryCtaLink
                        key={i}
                        href={l.href}
                        target={l.target}
                        size="hero"
                        className="!h-[54px] w-full !max-w-none !justify-between !gap-2 !rounded-[27px] !px-3 !text-lg !leading-6 !shadow-none sm:!gap-8"
                      >
                        {t}
                      </PrimaryCtaLink>
                    );
                  }
                  if (i === 1) {
                    return (
                      <Link
                        key={i}
                        href={l.href}
                        target={l.target}
                        rel={l.target === "_blank" ? "noopener noreferrer" : undefined}
                        className="inline-flex h-[54px] w-full min-w-0 max-w-full items-center justify-between gap-4 rounded-[27px] bg-white pl-3 pr-[21px] text-lg font-medium leading-6 text-navy shadow-none transition hover:bg-white/95"
                      >
                        <span className="min-w-0 break-words text-balance [text-align:left] sm:whitespace-nowrap">{t}</span>
                        <ArrowInCircle variant="on-light" className="!h-6 !w-6 shrink-0" />
                      </Link>
                    );
                  }
                  return (
                    <Button key={i} href={l.href} variant="secondary" target={l.target} className="h-12 w-full max-w-md rounded-3xl">
                      {t}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
