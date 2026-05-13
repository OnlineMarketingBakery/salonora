import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import type { ProblemSolutionSectionT } from "@/types/sections";
import type { CSSProperties } from "react";

/** Figma **1306:29** left card — deep navy stack + cool TR highlight (tokens only). */
const PROBLEM_CARD_BG: CSSProperties = {
  backgroundImage: [
    "radial-gradient(ellipse 95% 85% at 100% 0%, color-mix(in srgb, var(--palette-brand) 22%, transparent) 0%, transparent 52%)",
    "linear-gradient(180deg, var(--palette-navy) 0%, var(--palette-navy-deep) 100%)",
  ].join(", "),
};

/** Figma **1306:29** right card — brand blues + soft TR highlight. */
const SOLUTION_CARD_BG: CSSProperties = {
  backgroundImage: [
    "radial-gradient(ellipse 95% 85% at 100% 0%, color-mix(in srgb, var(--palette-white) 18%, transparent) 0%, transparent 50%)",
    "linear-gradient(152deg, var(--palette-brand-soft) 0%, var(--palette-brand) 40%, var(--palette-brand-strong) 100%)",
  ].join(", "),
};

const CARD_PROSE =
  "text-left max-w-none [&_p:not(:first-child)]:mt-3.5 !prose-p:mb-0 !prose-p:mt-0 !prose-p:text-[14px] !prose-p:leading-[1.6] !prose-p:text-[var(--palette-white)] !prose-strong:font-semibold !prose-strong:text-[var(--palette-white)] !prose-li:text-[var(--palette-white)] !prose-a:text-[var(--palette-white)] prose-a:underline [&_*]:text-[var(--palette-white)]";

function CardGridWash() {
  return (
    <div
      className="pointer-events-none absolute right-0 top-0 z-[1] h-[46%] w-[42%] opacity-[0.14]"
      style={{
        backgroundImage: [
          "repeating-linear-gradient(90deg, transparent 0px, transparent 10px, var(--palette-white) 10px, var(--palette-white) 11px)",
          "repeating-linear-gradient(0deg, transparent 0px, transparent 10px, var(--palette-white) 10px, var(--palette-white) 11px)",
        ].join(","),
        maskImage: "linear-gradient(135deg, black 0%, transparent 72%)",
        WebkitMaskImage: "linear-gradient(135deg, black 0%, transparent 72%)",
      }}
      aria-hidden
    />
  );
}

function SolutionCheckRow({ text }: { text: string }) {
  return (
    <li className="flex items-end gap-1.5">
      <span
        className="relative grid size-[23px] shrink-0 place-items-center rounded-full bg-[var(--palette-white)]"
        aria-hidden
      >
        <svg
          className="size-[15px] text-[var(--palette-brand)]"
          viewBox="0 0 15 13"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M1 6.5L5.5 11L14 1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <p className="min-w-0 flex-1 font-sans text-[14px] leading-[1.6] text-[var(--palette-white)]">{text}</p>
    </li>
  );
}

export function ProblemSolutionSection({
  section,
  lang,
}: {
  section: ProblemSolutionSectionT;
  lang: Locale;
}) {
  void lang;
  const cardShell =
    "relative flex min-h-0 w-full flex-col overflow-hidden rounded-[24px] px-8 py-10 sm:px-10 sm:py-11 lg:min-h-[668px] lg:max-h-none lg:px-[46px] lg:py-[46px]";

  return (
    <section className="bg-[var(--palette-white)] py-12 md:py-16">
      <Container className="!max-w-[81.25rem]">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-6">
          <article className={`${REVEAL_ITEM} ${cardShell}`} style={PROBLEM_CARD_BG}>
            <CardGridWash />
            <div className="relative z-[2] flex min-h-0 w-full max-w-[30.25rem] flex-col gap-[22px] pb-[min(42vw,220px)] lg:pb-8">
              {section.problem_title ? (
                <h2 className="font-sans text-[clamp(1.5rem,3.5vw,2.125rem)] font-semibold leading-[0.98] tracking-[-0.02em] text-[var(--palette-white)]">
                  {section.problem_title}
                </h2>
              ) : null}
              {section.problem_text ? (
                <RichText html={section.problem_text} className={CARD_PROSE} />
              ) : null}
            </div>
            {section.problem_image ? (
              <div
                className="pointer-events-none absolute bottom-0 right-0 z-[1] flex max-h-[min(52%,353px)] w-[min(48%,280px)] max-w-[90vw] items-end justify-end sm:w-[min(42%,320px)] lg:max-h-[353px] lg:w-[235px]"
                aria-hidden
              >
                <Media
                  image={section.problem_image}
                  width={470}
                  height={706}
                  className="h-auto w-full max-w-none object-contain object-bottom"
                  sizes="(max-width: 1024px) 45vw, 235px"
                  preferLargestSource
                />
              </div>
            ) : null}
          </article>

          <article className={`${REVEAL_ITEM} ${cardShell}`} style={SOLUTION_CARD_BG}>
            <CardGridWash />
            <div className="relative z-[2] flex min-h-0 w-full max-w-[33.5rem] flex-col gap-[22px] pb-[min(48vw,240px)] lg:max-w-none lg:pb-10">
              {section.solution_title ? (
                <h2 className="font-sans text-[clamp(1.5rem,3.5vw,2.125rem)] font-semibold leading-[0.98] tracking-[-0.02em] text-[var(--palette-white)]">
                  {section.solution_title}
                </h2>
              ) : null}
              {section.solution_text ? (
                <RichText html={section.solution_text} className={CARD_PROSE} />
              ) : null}
              {section.solution_list.length > 0 ? (
                <ul className="mt-1 flex max-w-[22.3125rem] flex-col gap-3">
                  {section.solution_list.map((row, i) => (
                    <SolutionCheckRow key={`${row.text}-${i}`} text={row.text} />
                  ))}
                </ul>
              ) : null}
            </div>
            {section.solution_image ? (
              <div
                className="pointer-events-none absolute bottom-0 right-0 z-[1] flex max-h-[min(54%,363px)] w-[min(52%,300px)] max-w-[92vw] items-end justify-end sm:w-[min(46%,340px)] lg:max-h-[363px] lg:w-[288px]"
                aria-hidden
              >
                <Media
                  image={section.solution_image}
                  width={576}
                  height={726}
                  className="h-auto w-full max-w-none object-contain object-bottom"
                  sizes="(max-width: 1024px) 50vw, 288px"
                  preferLargestSource
                />
              </div>
            ) : null}
          </article>
        </div>
      </Container>
    </section>
  );
}
