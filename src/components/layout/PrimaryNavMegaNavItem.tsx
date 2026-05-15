"use client";

import { PrimaryNavMegaDropdown } from "@/components/layout/PrimaryNavMegaDropdown";
import { SubmenuChevronIcon } from "@/components/layout/nav-submenu-chevron";
import { prefetchWhoWeServeMegaPreviews } from "@/components/layout/who-we-serve-mega-previews";
import type { MenuItem } from "@/types/menu";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const SHELL_SELECTOR = "[data-site-header-shell]";

const MEGA_MENU_GAP_PX = -4;
/** Max mega width (px); panel stays centered under the header shell when the shell is wider. */
const MEGA_MENU_MAX_WIDTH_PX = 850;

type Align = {
  megaLeft: number;
  megaTop: number;
  megaWidth: number;
  bridgeLeft: number;
  bridgeTop: number;
  bridgeWidth: number;
  bridgeHeight: number;
};

type Props = {
  item: MenuItem;
};

export function PrimaryNavMegaNavItem({ item }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [align, setAlign] = useState<Align | null>(null);

  const measure = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const shell = root.closest(SHELL_SELECTOR);
    if (!shell) return;
    const s = shell.getBoundingClientRect();
    const r = root.getBoundingClientRect();
    const megaTop = Math.ceil(s.bottom + MEGA_MENU_GAP_PX);
    const megaWidth = Math.min(s.width, MEGA_MENU_MAX_WIDTH_PX);
    const megaLeft = s.left + (s.width - megaWidth) / 2;
    const bridgeTop = r.bottom;
    const bridgeHeight = Math.max(0, megaTop - r.bottom);
    setAlign({
      megaLeft,
      megaTop,
      megaWidth,
      bridgeLeft: s.left,
      bridgeTop,
      bridgeWidth: s.width,
      bridgeHeight,
    });
  }, []);

  useLayoutEffect(() => {
    measure();
    const root = rootRef.current;
    const shell = root?.closest(SHELL_SELECTOR) ?? null;
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => measure())
        : null;
    if (shell) ro?.observe(shell);
    if (root) ro?.observe(root);
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  useEffect(() => {
    prefetchWhoWeServeMegaPreviews();
  }, []);

  return (
    <div ref={rootRef} className="group relative">
      <Link
        href={item.href}
        className="relative flex items-center gap-2 whitespace-nowrap py-1 text-[16px] font-medium tracking-[-0.04em] text-navy transition-opacity duration-200 hover:opacity-85"
        target={item.target}
        aria-haspopup="menu"
        onPointerEnter={prefetchWhoWeServeMegaPreviews}
      >
        <span>{item.label}</span>
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-navy"
          aria-hidden
        >
          <SubmenuChevronIcon className="translate-y-px" />
        </span>
      </Link>
      {align ? (
        <div
          aria-hidden
          className="pointer-events-none fixed z-59 group-hover:pointer-events-auto group-focus-within:pointer-events-auto"
          style={{
            left: align.bridgeLeft,
            top: align.bridgeTop,
            width: align.bridgeWidth,
            height: align.bridgeHeight,
          }}
        />
      ) : null}
      <div
        className={
          align
            ? "pointer-events-none invisible fixed z-60 opacity-0 transition-[opacity,visibility] duration-300 ease-out group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100"
            : "pointer-events-none invisible fixed z-60 opacity-0"
        }
        role="presentation"
        style={
          align
            ? {
                left: align.megaLeft,
                top: align.megaTop,
                width: align.megaWidth,
              }
            : undefined
        }
      >
        <PrimaryNavMegaDropdown items={item.children} menuLabel={item.label} />
      </div>
    </div>
  );
}
