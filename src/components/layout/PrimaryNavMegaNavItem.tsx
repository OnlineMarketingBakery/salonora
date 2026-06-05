"use client";

import { PrimaryNavMegaDropdown } from "@/components/layout/PrimaryNavMegaDropdown";
import { SubmenuChevronIcon } from "@/components/layout/nav-submenu-chevron";
import { prefetchWhoWeServeMegaPreviews } from "@/components/layout/who-we-serve-mega-previews";
import type { MenuItem } from "@/types/menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

const PANEL_OPEN =
  "pointer-events-auto visible opacity-100";
const PANEL_CLOSED =
  "pointer-events-none invisible opacity-0";

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
  const [hoverOpen, setHoverOpen] = useState(false);
  const [focusOpen, setFocusOpen] = useState(false);
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const isOpen = hoverOpen || focusOpen;

  const closeMenu = useCallback(() => {
    setHoverOpen(false);
    setFocusOpen(false);
    const root = rootRef.current;
    if (!root) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && root.contains(active)) {
      active.blur();
    }
  }, []);

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

  useEffect(() => {
    if (pathnameRef.current === pathname) return;
    pathnameRef.current = pathname;
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (root && !root.contains(event.target as Node)) {
        closeMenu();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isOpen, closeMenu]);

  const panelClass = isOpen ? PANEL_OPEN : PANEL_CLOSED;

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => setHoverOpen(true)}
      onMouseLeave={() => setHoverOpen(false)}
      onFocusCapture={() => setFocusOpen(true)}
      onBlurCapture={(event) => {
        const next = event.relatedTarget as Node | null;
        if (!next || !rootRef.current?.contains(next)) {
          setFocusOpen(false);
        }
      }}
    >
      <Link
        href={item.href}
        className="relative flex items-center gap-2 whitespace-nowrap py-1 text-[16px] font-medium text-navy transition-opacity duration-200 hover:opacity-85"
        target={item.target}
        aria-haspopup="menu"
        aria-expanded={isOpen}
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
          className={`fixed z-59 transition-[opacity,visibility] duration-300 ease-out ${panelClass}`}
          style={{
            left: align.bridgeLeft,
            top: align.bridgeTop,
            width: align.bridgeWidth,
            height: align.bridgeHeight,
          }}
        />
      ) : null}
      <div
        className={`fixed z-60 transition-[opacity,visibility] duration-300 ease-out ${panelClass}`}
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
        <PrimaryNavMegaDropdown
          items={item.children}
          menuLabel={item.label}
          onItemClick={closeMenu}
        />
      </div>
    </div>
  );
}
