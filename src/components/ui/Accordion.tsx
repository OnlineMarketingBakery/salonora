"use client";

import { useId, useState } from "react";

type Item = { id: string; title: string; content: string };

export function Accordion({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id || null);
  return (
    <div className="space-y-2">
      {items.map((it) => (
        <AccordionRow key={it.id} item={it} isOpen={open === it.id} onToggle={() => setOpen((o) => (o === it.id ? null : it.id))} />
      ))}
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
