"use client";

import { useId, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { RichText } from "@/components/ui/RichText";
import { registerGsapClient } from "@/lib/gsap/register";
import { REVEAL_ITEM } from "@/lib/animation-classes";

type Item = { id: string; title: string; content: string };

function PlusIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function usePanelHeight(
  panelRef: React.RefObject<HTMLDivElement | null>,
  iconRef: React.RefObject<HTMLElement | null>,
  isOpen: boolean,
  opts: { split: boolean },
) {
  const didInit = useRef(false);

  useGSAP(
    () => {
      registerGsapClient();
      const panel = panelRef.current;
      const icon = iconRef.current;
      if (!panel) return;

      if (!didInit.current) {
        didInit.current = true;
        gsap.set(panel, { height: isOpen ? "auto" : 0 });
        if (icon) gsap.set(icon, { rotate: isOpen ? (opts.split ? 45 : 180) : 0 });
        return;
      }

      if (isOpen) {
        gsap.fromTo(panel, { height: 0 }, { height: "auto", duration: 0.42, ease: "power2.out" });
      } else {
        gsap.to(panel, { height: 0, duration: 0.34, ease: "power2.inOut" });
      }
      if (icon) {
        gsap.to(icon, {
          rotate: isOpen ? (opts.split ? 45 : 180) : 0,
          duration: 0.38,
          ease: "power2.out",
        });
      }
    },
    { dependencies: [isOpen, opts.split] },
  );
}

export function Accordion({ items, variant = "default" }: { items: Item[]; variant?: "default" | "split" }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id || null);
  if (variant === "split") {
    return (
      <div className="flex w-full flex-col gap-5">
        {items.map((it) => (
          <AccordionRowSplit key={it.id} item={it} isOpen={open === it.id} onToggle={() => setOpen((o) => (o === it.id ? null : it.id))} />
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {items.map((it) => (
        <AccordionRow key={it.id} item={it} isOpen={open === it.id} onToggle={() => setOpen((o) => (o === it.id ? null : it.id))} />
      ))}
    </div>
  );
}

function AccordionRowSplit({
  item,
  isOpen,
  onToggle,
}: {
  item: Item;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const id = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  usePanelHeight(panelRef, iconRef, isOpen, { split: true });

  return (
    <div className={`overflow-hidden rounded-[14px] bg-card ${REVEAL_ITEM}`}>
      <button
        type="button"
        className="flex min-h-[79px] w-full items-center gap-[18px] p-[14px] text-left font-sans transition hover:bg-white/30"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={id}
      >
        <span className="flex size-[51px] shrink-0 items-center justify-center rounded-lg bg-white p-[15px] text-brand">
          <span ref={iconRef} className="inline-flex will-change-transform">
            <PlusIcon className="h-[21px] w-[21px]" />
          </span>
        </span>
        <span className="min-w-0 text-xl font-normal leading-[1.1] tracking-[-0.8px] text-slate-900">{item.title}</span>
      </button>
      <div
        ref={panelRef}
        id={id}
        className="overflow-hidden border-t border-slate-900/10"
        aria-hidden={!isOpen}
      >
        <div className="px-[14px] py-3 pl-5 text-base font-normal leading-relaxed sm:pl-[83px] sm:pr-4">
          <RichText
            html={item.content}
            className="!prose-p:mb-0 !prose-p:mt-0 whitespace-pre-line [text-wrap:balance] !prose-p:text-muted [&>p+_p]:!mt-2"
          />
        </div>
      </div>
    </div>
  );
}

function AccordionRow({
  item,
  isOpen,
  onToggle,
}: {
  item: Item;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const id = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  usePanelHeight(panelRef, iconRef, isOpen, { split: false });

  return (
    <div className={`overflow-hidden rounded-xl border border-surface bg-white ${REVEAL_ITEM}`}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-normal text-foreground md:px-5"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={id}
      >
        {item.title}
        <span ref={iconRef} className="inline-flex text-brand will-change-transform" aria-hidden>
          ▼
        </span>
      </button>
      <div ref={panelRef} id={id} className="overflow-hidden border-t border-surface" aria-hidden={!isOpen}>
        <div className="px-4 py-3 text-sm text-muted md:px-5">
          <RichText
            html={item.content}
            className="!prose-p:mb-0 !prose-p:mt-0 prose-sm !prose-p:text-muted [&>p+_p]:!mt-2"
          />
        </div>
      </div>
    </div>
  );
}
