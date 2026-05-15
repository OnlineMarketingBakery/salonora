import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { getImageUrl, getLargestImageUrl } from "@/lib/utils/media";
import type { ProblemSolutionSectionT } from "@/types/sections";
import type { WpImage } from "@/types/wordpress";
import type { CSSProperties } from "react";

/** Figma **1306:29** left card — deep navy stack + soft TR highlight. */
const PROBLEM_CARD_BG: CSSProperties = {
  backgroundImage: [
    "radial-gradient(ellipse 95% 85% at 100% 0%, color-mix(in srgb, var(--palette-brand) 16%, transparent) 0%, transparent 52%)",
    "linear-gradient(180deg, var(--palette-navy) 0%, var(--palette-navy-deep) 100%)",
  ].join(", "),
};

/** Figma **1306:29** right card — brand blues + soft TR highlight. */
const SOLUTION_CARD_BG: CSSProperties = {
  backgroundImage: [
    "radial-gradient(ellipse 95% 85% at 100% 0%, color-mix(in srgb, var(--palette-white) 14%, transparent) 0%, transparent 50%)",
    "linear-gradient(152deg, var(--palette-brand-soft) 0%, var(--palette-brand) 40%, var(--palette-brand-strong) 100%)",
  ].join(", "),
};

const CARD_PROSE =
  "text-left max-w-none [&_p:not(:first-child)]:mt-3.5 !prose-p:mb-0 !prose-p:mt-0 !prose-p:text-[14px] !prose-p:leading-[1.6] !prose-p:text-[var(--palette-white)] !prose-strong:font-semibold !prose-strong:text-[var(--palette-white)] !prose-li:text-[var(--palette-white)] !prose-a:text-[var(--palette-white)] prose-a:underline [&_*]:text-[var(--palette-white)]";

/** Invisible float: `shape-outside` nudges only the last lines around the bottom-right portrait (paired with absolute `Media`). */
function BottomRightWrapRail({
  wPx,
  hPx,
  shapeOutside,
  pullUpClass,
}: {
  wPx: number;
  hPx: number;
  shapeOutside: string;
  pullUpClass: string;
}) {
  return (
    <div
      aria-hidden
      className={`invisible float-right clear-both hidden shrink-0 lg:block ${pullUpClass}`}
      style={{
        width: wPx,
        height: hPx,
        shapeOutside,
        shapeMargin: "0.625rem",
      }}
    />
  );
}

/** `public/grid.svg` — clipped to the **top half** of the card only. */
function CardGridWash() {
  return (
    <div
      className="pointer-events-none absolute left-0 top-0 z-0 h-1/2 w-full overflow-hidden rounded-t-[24px]"
      aria-hidden
    >
      <div
        className="absolute right-0 top-0 h-full w-[min(100%,52%)] opacity-[0.38]"
        style={{
          backgroundImage: "url(/grid.svg)",
          backgroundPosition: "100% 0",
          backgroundRepeat: "no-repeat",
          backgroundSize: "auto min(100%, 320px)",
        }}
      />
    </div>
  );
}

function SolutionCheckRow({
  text,
  listIcon,
}: {
  text: string;
  listIcon: WpImage | null;
}) {
  const customIcon =
    listIcon != null && (getLargestImageUrl(listIcon) || getImageUrl(listIcon))
      ? listIcon
      : null;

  const defaultMarker = (
    <span
      className="relative grid size-[23px] shrink-0 place-items-center rounded-full bg-[var(--palette-white)]"
      aria-hidden
    >
      <svg
        className="size-[15px] text-[var(--palette-brand-strong)]"
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
  );

  const marker =
    customIcon != null ? (
      <span
        className="relative flex size-[23px] shrink-0 items-end justify-center"
        aria-hidden
      >
        <Media
          image={customIcon}
          width={46}
          height={46}
          className="h-[23px] w-[23px] object-contain object-bottom"
          sizes="23px"
          preferLargestSource
          quality={95}
        />
      </span>
    ) : (
      defaultMarker
    );

  return (
    <li className="flex items-end gap-1.5">
      {marker}
      <p className="min-w-0 flex-1 font-sans text-[14px] leading-[1.6] text-[var(--palette-white)]">
        {text}
      </p>
    </li>
  );
}

/** Figma **1306:29** — portrait box (logical px). */
const PROBLEM_FIGURE = { w: 235, h: 353 };
const SOLUTION_FIGURE = { w: 288, h: 363 };

/** Mobile: reserve space so copy does not run under bottom-right cutouts. */
const PROBLEM_CONTENT_PB = "pb-[clamp(10.5rem,44vw,15.5rem)] lg:pb-0";
const SOLUTION_CONTENT_PB = "pb-[clamp(11.5rem,48vw,17rem)] lg:pb-0";

const FIGURE_BLEED = "-mb-10 -mr-8 sm:-mb-11 sm:-mr-10 lg:mb-0 lg:mr-0";

const PROBLEM_FIGURE_SHELL = `pointer-events-none absolute bottom-0 right-0 z-[1] flex items-end justify-end overflow-visible ${FIGURE_BLEED} w-[200px] sm:h-[clamp(220px,50vw,360px)] sm:w-[clamp(188px,54vw,260px)] lg:h-[353px] lg:w-[235px]`;

const SOLUTION_FIGURE_SHELL = `pointer-events-none absolute bottom-0 right-0 z-[1] flex items-end justify-end overflow-visible ${FIGURE_BLEED} w-[245px] sm:h-[clamp(240px,52vw,380px)] sm:w-[clamp(200px,58vw,288px)] lg:h-[363px] lg:w-[288px]`;

export function ProblemSolutionSection({
  section,
  lang,
}: {
  section: ProblemSolutionSectionT;
  lang: Locale;
}) {
  void lang;
  const listIcon = section.solution_list_icon;
  const cardShell =
    "relative flex min-h-0 w-full flex-col overflow-hidden rounded-[24px] px-8 py-10 sm:px-10 sm:py-11 lg:min-h-[668px] lg:max-h-none lg:px-[46px] lg:py-[46px]";

  return (
    <section className="bg-[var(--palette-white)] py-12 md:py-16">
      <Container className="!max-w-[81.25rem]">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-6">
          <article
            className={`${REVEAL_ITEM} ${cardShell}`}
            style={PROBLEM_CARD_BG}
          >
            <CardGridWash />
            <div
              className={`relative z-[1] flex min-h-0 w-full min-w-0 flex-col gap-[22px] self-stretch [overflow-wrap:anywhere] lg:flex-1 ${section.problem_image ? PROBLEM_CONTENT_PB : ""}`}
            >
              {section.problem_title ? (
                <h2 className="w-full font-sans text-[clamp(1.5rem,3.5vw,2.125rem)] font-semibold leading-[0.98] tracking-[-0.02em] text-[var(--palette-white)]">
                  {section.problem_title}
                </h2>
              ) : null}
              <div className="relative min-h-0 w-full min-w-0 self-stretch lg:flex-1 lg:block lg:flow-root lg:min-h-0">
                {section.problem_text ? (
                  <RichText
                    html={section.problem_text}
                    className={`relative z-[2] max-w-[30.1875rem] lg:max-w-none ${CARD_PROSE}`}
                  />
                ) : null}
                {section.problem_image ? (
                  <BottomRightWrapRail
                    wPx={PROBLEM_FIGURE.w + 12}
                    hPx={PROBLEM_FIGURE.h}
                    shapeOutside="ellipse(78% 68% at 88% 100%)"
                    pullUpClass="-mt-[min(300px,42vw)]"
                  />
                ) : null}
              </div>
            </div>
            {section.problem_image ? (
              <div className={PROBLEM_FIGURE_SHELL} aria-hidden>
                <Media
                  image={section.problem_image}
                  width={470}
                  height={706}
                  className="h-full w-full max-h-none max-w-none object-contain object-bottom object-right"
                  sizes="(max-width: 1024px) 58vw, 235px"
                  preferLargestSource
                />
              </div>
            ) : null}
          </article>

          <article
            className={`${REVEAL_ITEM} ${cardShell}`}
            style={SOLUTION_CARD_BG}
          >
            <CardGridWash />
            <div
              className={`relative z-[1] flex min-h-0 w-full min-w-0 flex-col gap-[22px] self-stretch [overflow-wrap:anywhere] lg:flex-1 ${section.solution_image ? SOLUTION_CONTENT_PB : ""}`}
            >
              {section.solution_title ? (
                <h2 className="w-full font-sans text-[clamp(1.5rem,3.5vw,2.125rem)] font-semibold leading-[0.98] tracking-[-0.02em] text-[var(--palette-white)]">
                  {section.solution_title}
                </h2>
              ) : null}
              <div className="relative min-h-0 w-full min-w-0 self-stretch lg:flex-1 lg:block lg:flow-root lg:min-h-0">
                {section.solution_text ? (
                  <RichText
                    html={section.solution_text}
                    className={`relative z-[2] max-w-[33.5rem] lg:max-w-none ${CARD_PROSE}`}
                  />
                ) : null}
                {section.solution_list.length > 0 ? (
                  <ul className="relative z-[2] mt-1 flex max-w-[22.3125rem] flex-col gap-3 lg:max-w-none">
                    {section.solution_list.map((row, i) => (
                      <SolutionCheckRow
                        key={`${row.text}-${i}`}
                        text={row.text}
                        listIcon={listIcon}
                      />
                    ))}
                  </ul>
                ) : null}
                {section.solution_bottom_text ? (
                  <RichText
                    html={section.solution_bottom_text}
                    className={`relative z-[2] mt-3.5 max-w-[33.5rem] lg:max-w-none ${CARD_PROSE}`}
                  />
                ) : null}
                {section.solution_image ? (
                  <BottomRightWrapRail
                    wPx={SOLUTION_FIGURE.w + 14}
                    hPx={SOLUTION_FIGURE.h}
                    shapeOutside="ellipse(80% 70% at 86% 100%)"
                    pullUpClass="-mt-[min(320px,44vw)]"
                  />
                ) : null}
              </div>
            </div>
            {section.solution_image ? (
              <div className={SOLUTION_FIGURE_SHELL} aria-hidden>
                <Media
                  image={section.solution_image}
                  width={576}
                  height={726}
                  className="h-full w-full max-h-none max-w-none object-contain object-bottom object-right"
                  sizes="(max-width: 1024px) 62vw, 288px"
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
