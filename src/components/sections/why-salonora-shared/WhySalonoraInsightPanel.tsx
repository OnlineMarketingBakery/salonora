import { RichText } from "@/components/ui/RichText";
import { InsightPattern } from "@/components/sections/why-salonora-shared/InsightPattern";
import { WhySalonoraPhoneMockup } from "@/components/sections/why-salonora-shared/WhySalonoraPhoneMockup";

function InsightCard({ index, text }: { index: number; text: string }) {
  const raw = text.trim();
  const looksLikeHtml = /<\s*[a-z][\s\S]*>/i.test(raw);
  const isLongCard = index === 2;

  return (
    <div
      className={`surface-light flex w-full shrink-0 items-center justify-center rounded-[24.5px] bg-white p-6 lg:p-6 ${
        isLongCard ? "lg:h-[104px]" : "lg:h-[77px]"
      }`}
    >
      {looksLikeHtml ? (
        <RichText
          html={text}
          className="w-full text-center! !prose-p:mb-0 !prose-p:mt-0 !prose-p:text-sm !prose-p:font-normal !prose-p:leading-[1.4] !prose-p:text-copy [&_p+_p]:mt-0! lg:!prose-p:text-[14px]"
        />
      ) : (
        <p className="w-full text-center font-sans text-sm font-normal leading-[1.4] text-copy whitespace-pre-line lg:text-[14px]">
          {raw}
        </p>
      )}
    </div>
  );
}

/** Figma 754:32 — 898×509 insight panel (cards + phone). */
export function WhySalonoraInsightPanel({
  sectionId,
  insightHeading,
  insightCards,
}: {
  sectionId: string;
  insightHeading?: string;
  insightCards: { text: string }[];
}) {
  const cards = insightCards.filter((c) => c.text.trim());

  return (
    <div className="relative isolate w-full overflow-hidden rounded-[14px] lg:h-[509px]">
      <div
        className="pointer-events-none absolute inset-0 rounded-[14px] bg-linear-to-b from-brand to-brand-strong"
        aria-hidden
      />
      <InsightPattern />

      {/* Figma 754:32 — justify-end pins row to panel bottom; px-[56px] */}
      <div className="relative z-10 flex h-full flex-col items-center justify-end px-5 pt-8 pb-0 sm:px-8 sm:pt-10 sm:pb-0 lg:px-14 lg:py-0">
        {/* Figma 754:30 — 417px + 45px gap + 324px phone, items-center between columns */}
        <div className="flex w-full max-w-[786px] flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-center lg:gap-[45px]">
          {/* Figma 346:6037 */}
          <div className="flex w-full max-w-[417px] flex-col items-center gap-[15px] lg:w-[417px] lg:shrink-0">
            {insightHeading ? (
              <p className="w-full shrink-0 text-center font-sans text-[28px] font-semibold leading-tight text-white sm:text-[32px] lg:text-[34px] lg:leading-[56px]">
                {insightHeading}
              </p>
            ) : null}
            {cards.length > 0 ? (
              <div className="flex w-full flex-col gap-[14px]">
                {cards.map((card, i) => (
                  <InsightCard key={`${sectionId}-insight-${i}`} index={i} text={card.text} />
                ))}
              </div>
            ) : null}
          </div>

          {/* Figma 346:6142 — layered phone mockup, bottom flush via parent justify-end */}
          <WhySalonoraPhoneMockup className="drop-shadow-[0_20px_40px_rgba(0,39,82,0.35)]" />
        </div>
      </div>
    </div>
  );
}
