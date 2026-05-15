"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { megaPreviewForChild } from "@/components/layout/who-we-serve-mega-previews";
import type { MenuItem } from "@/types/menu";

type Props = {
  items: MenuItem[];
  /** Parent nav label for `aria-label` on the menu surface */
  menuLabel: string;
};

export function PrimaryNavMegaDropdown({ items, menuLabel }: Props) {
  const [active, setActive] = useState(0);
  const count = items.length;
  const safe = count > 0 ? Math.min(active, count - 1) : 0;
  const current = count > 0 ? items[safe] : null;
  const src = current ? megaPreviewForChild(current.href, safe) : "";

  if (count === 0) {
    return null;
  }

  return (
    <div
      className="isolate flex w-full max-w-full flex-row items-stretch gap-5 rounded-[20px] bg-white p-5 shadow-2xl ring-1 ring-brand/10 sm:gap-6 sm:p-6 lg:gap-8 lg:p-7"
      role="menu"
      aria-label={menuLabel}
    >
      <div
        className="flex min-h-[375px] w-[min(100%,15rem)] shrink-0 flex-col justify-center gap-2 sm:w-[min(100%,16rem)]"
        role="none"
      >
        {items.map((c, i) => {
          const rowActive = i === safe;
          return (
            <Link
              key={c.id}
              href={c.href}
              target={c.target}
              role="menuitem"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className={
                rowActive
                  ? "flex min-h-14 shrink-0 items-center rounded-xl bg-brand px-4 py-2.5 text-[15px] font-medium tracking-[-0.04em] text-white shadow-md outline-none transition-[background-color,box-shadow,color] duration-300 ease-out focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-brand sm:min-h-15 sm:rounded-2xl sm:px-5 sm:text-[16px]"
                  : "flex min-h-14 shrink-0 items-center rounded-xl bg-surface px-4 py-2.5 text-[15px] font-medium tracking-[-0.04em] text-navy outline-none transition-[background-color,box-shadow,color] duration-300 ease-out hover:bg-pill hover:shadow-sm focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:min-h-15 sm:rounded-2xl sm:px-5 sm:text-[16px]"
              }
            >
              {c.label}
            </Link>
          );
        })}
      </div>
      <div
        className="relative h-[375px] min-h-[280px] w-0 min-w-0 flex-1 overflow-hidden rounded-2xl bg-surface shadow-inner ring-1 ring-inset ring-navy/10 lg:rounded-[22px]"
        aria-hidden
      >
        {current && src ? (
          <Image
            src={src}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 900px) 50vw, 480px"
            unoptimized
            decoding="async"
            fetchPriority="low"
          />
        ) : null}
      </div>
    </div>
  );
}
