"use client";

import { useId, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { FaqAccordionPlusIcon } from "@/components/ui/FaqAccordionPlusIcon";
import { RichText } from "@/components/ui/RichText";
import { registerGsapClient } from "@/lib/gsap/register";
import { formatFaqAnswer } from "@/lib/legal/format-faq-answer";

export type FaqAccordionItem = {
  id: string;
  title: string;
  content: string;
};

function FaqAccordionRow({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqAccordionItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const didInit = useRef(false);

  useGSAP(
    () => {
      registerGsapClient();
      const panel = panelRef.current;
      if (!panel) return;

      if (!didInit.current) {
        didInit.current = true;
        gsap.set(panel, { height: isOpen ? "auto" : 0 });
        return;
      }

      if (isOpen) {
        gsap.fromTo(panel, { height: 0 }, { height: "auto", duration: 0.28, ease: "power2.out" });
      } else {
        gsap.to(panel, { height: 0, duration: 0.25, ease: "power2.inOut" });
      }
    },
    { dependencies: [isOpen] }
  );

  return (
    <div
      className={`faq-accordion-item overflow-hidden rounded-xl border transition-colors duration-200 ${
        isOpen
          ? "border-brand/30 bg-[color-mix(in_srgb,var(--palette-brand)_10%,var(--palette-white))] shadow-[0_4px_20px_-8px_rgba(57,144,240,0.22)]"
          : "border-[color-mix(in_srgb,var(--palette-brand)_12%,transparent)] bg-white"
      }`}
    >
      <button
        type="button"
        className={`faq-accordion-trigger flex min-h-12 w-full items-center gap-3.5 px-4 py-3 text-left sm:gap-4 sm:px-5 ${
          isOpen
            ? "border-l-4 border-l-brand pl-[calc(1rem-4px)] sm:pl-[calc(1.25rem-4px)]"
            : "border-l-4 border-l-transparent"
        }`}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <span className="faq-accordion-icon-box flex size-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-brand/35 sm:size-14">
          <span
            className={`inline-flex text-brand transition-transform duration-300 ease-out ${
              isOpen ? "rotate-45" : "rotate-0"
            }`}
            aria-hidden
          >
            <FaqAccordionPlusIcon className="h-[21px] w-[21px] sm:h-[21px] sm:w-[21px]" />
          </span>
        </span>
        <span className="min-w-0 flex-1 text-[1.0625rem] font-semibold leading-snug text-navy-deep">
          {item.title}
        </span>
      </button>
      <div ref={panelRef} id={panelId} className="overflow-hidden" aria-hidden={!isOpen}>
        <div
          className={`faq-accordion-panel border-t px-4 pb-5 pt-2 sm:px-5 ${
            isOpen ? "border-brand/15" : "border-brand/10"
          }`}
        >
          <RichText
            html={item.content}
            className="faq-accordion-answer !prose-p:mb-0 !prose-p:mt-0 [&>p+_p]:!mt-4"
            prose={false}
          />
        </div>
      </div>
    </div>
  );
}

export function FaqPageAccordion({
  items,
  openId,
  onToggle,
}: {
  items: FaqAccordionItem[];
  openId: string | null;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="faq-accordion-list flex w-full flex-col gap-3.5 sm:gap-4">
      {items.map((it) => (
        <FaqAccordionRow
          key={it.id}
          item={it}
          isOpen={openId === it.id}
          onToggle={() => onToggle(it.id)}
        />
      ))}
    </div>
  );
}

export function faqEntriesToAccordionItems(
  items: { id: string; question: string; answer: string }[]
): FaqAccordionItem[] {
  return items.map((q) => ({
    id: q.id,
    title: q.question,
    content: formatFaqAnswer(q.answer),
  }));
}
