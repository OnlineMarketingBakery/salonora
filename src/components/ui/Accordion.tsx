"use client";

import { useId, useState } from "react";

type Item = { id: string; title: string; content: string };

function PlusIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MinusIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
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
  return (
    <div className="overflow-hidden rounded-[14px] bg-card">
      <button
        type="button"
        className="flex min-h-[79px] w-full items-center gap-[18px] p-[14px] text-left font-sans transition hover:bg-white/30"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={id}
      >
        <span className="flex size-[51px] shrink-0 items-center justify-center rounded-lg bg-white p-[15px] text-brand">
          {isOpen ? <MinusIcon className="h-[21px] w-[21px]" /> : <PlusIcon className="h-[21px] w-[21px]" />}
        </span>
        <span className="min-w-0 text-xl font-semibold leading-[1.1] tracking-[-0.8px] text-slate-900">{item.title}</span>
      </button>
      {isOpen && (
        <div
          id={id}
          className="border-t border-slate-900/10 px-[14px] py-3 pl-5 text-base font-normal leading-relaxed text-muted sm:pl-[83px] sm:pr-4"
        >
          <p className="whitespace-pre-line [text-wrap:balance]">{item.content}</p>
        </div>
      )}
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
  return (
    <div className="overflow-hidden rounded-xl border border-surface bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-foreground md:px-5"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={id}
      >
        {item.title}
        <span className={`text-brand transition ${isOpen ? "rotate-180" : ""}`} aria-hidden>
          ▼
        </span>
      </button>
      {isOpen && (
        <div id={id} className="border-t border-surface px-4 py-3 text-sm text-muted md:px-5">
          {item.content}
        </div>
      )}
    </div>
  );
}
