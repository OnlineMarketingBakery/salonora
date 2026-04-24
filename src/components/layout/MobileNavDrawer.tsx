"use client";

import { useCallback, useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowInCircle } from "@/components/ui/ArrowInCircle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { MenuItem } from "@/types/menu";
import type { Locale } from "@/lib/i18n/locales";

type Cta = { href: string; label: string; target?: string };

type Props = {
  menu: MenuItem[];
  lang: Locale;
  showLanguageSwitcher: boolean;
  cta: Cta | null;
  className?: string;
};

function normalizePath(p: string) {
  if (!p) return "/";
  const t = p.replace(/\/$/, "");
  return t || "/";
}

/**
 * Pathname only, for same-origin links that may be absolute or relative.
 * Empty or missing `href` returns "" (not "/") so we never mis-classify as the site root.
 */
function pathOnlyFromHref(href: string): string {
  const raw = (href ?? "").trim();
  if (!raw) return "";
  const noHash = raw.split("#")[0] ?? "";
  const noQuery = noHash.split("?")[0] ?? "";
  if (noQuery.startsWith("http://") || noQuery.startsWith("https://")) {
    try {
      return normalizePath(new URL(noQuery).pathname);
    } catch {
      return normalizePath(noQuery);
    }
  }
  return normalizePath(noQuery);
}

function NavLinks({
  menu,
  isActive,
  onNavigate,
}: {
  menu: MenuItem[];
  isActive: (href: string) => boolean;
  onNavigate: () => void;
}) {
  return (
    <ul className="space-y-1">
      {menu.map((m) => (
        <li key={m.id}>
          <div>
            <Link
              href={m.href}
              target={m.target}
              rel={m.target === "_blank" ? "noopener noreferrer" : undefined}
              onClick={onNavigate}
              className={`block py-1.5 text-lg font-medium tracking-[-0.04em] ${
                isActive(m.href) ? "text-brand" : "text-navy"
              }`}
            >
              {m.label}
            </Link>
            {m.children.length > 0 && (
              <ul className="mb-2 mt-2 space-y-2.5 border-l-2 border-brand/20 pl-3.5">
                {m.children.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={c.href}
                      target={c.target}
                      rel={c.target === "_blank" ? "noopener noreferrer" : undefined}
                      onClick={onNavigate}
                      className={
                        isActive(c.href)
                          ? "text-[15px] font-medium text-brand"
                          : "text-[15px] text-muted/90 transition hover:text-navy"
                      }
                    >
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function MobileNavDrawer({ menu, lang, showLanguageSwitcher, cta, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [panelEnter, setPanelEnter] = useState(false);
  const panelId = useId();
  const pathname = usePathname() || "/";
  const onNavigate = useCallback(() => {
    setOpen(false);
  }, []);

  const isActive = useCallback(
    (href: string) => {
      const current = normalizePath(pathname);
      const target = pathOnlyFromHref(href);
      if (!target) {
        return false;
      }
      const home = normalizePath(`/${lang}`);
      if (target === home || target === "/") {
        return current === home || current === `/${lang}`;
      }
      return current === target || current.startsWith(`${target}/`);
    },
    [lang, pathname]
  );

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      setPanelEnter(false);
      return;
    }
    setPanelEnter(false);
    const id = requestAnimationFrame(() => setPanelEnter(true));
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className={className}>
      <button
        type="button"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[rgba(57,144,240,0.2)] bg-white/90 text-navy shadow-sm transition hover:bg-zinc-50/90"
        aria-label="Menu openen"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(true)}
      >
        <span className="flex flex-col gap-[5px]">
          <span className="h-0.5 w-5 rounded-full bg-navy" />
          <span className="h-0.5 w-5 rounded-full bg-navy" />
          <span className="h-0.5 w-5 rounded-full bg-navy" />
        </span>
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[100] cursor-default bg-navy-deep/50 backdrop-blur-[1px]"
            aria-label="Menu sluiten"
            onClick={() => setOpen(false)}
          />
          <div
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label="Hoofdnavigatie"
            className={`fixed inset-y-0 left-0 z-[110] flex w-[min(20rem,85vw)] max-w-full flex-col transform bg-zinc-50/98 shadow-[4px_0_32px_rgba(0,39,82,0.12)] transition-transform duration-300 ease-out ${
              panelEnter ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between gap-3 border-b border-zinc-200/80 px-5 py-4">
              {showLanguageSwitcher ? (
                <div className="shrink-0 rounded-full border border-white/80 bg-white/90 px-1.5 py-0.5 shadow-[0_1px_3px_rgba(48,89,133,0.12)]">
                  <LanguageSwitcher lang={lang} variant="header" className="!gap-0.5" />
                </div>
              ) : (
                <span aria-hidden className="inline-block min-w-px" />
              )}
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full text-muted transition hover:bg-zinc-200/60 hover:text-navy"
                onClick={() => setOpen(false)}
                aria-label="Menu sluiten"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <nav
              className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-5 py-4"
              aria-label="Primary"
            >
              <NavLinks menu={menu} isActive={isActive} onNavigate={onNavigate} />
            </nav>

            {cta && (
              <div className="shrink-0 border-t border-zinc-200/80 px-5 py-5">
                <Link
                  href={cta.href}
                  target={cta.target}
                  rel={cta.target === "_blank" ? "noopener noreferrer" : undefined}
                  onClick={() => setOpen(false)}
                  className="group inline-flex h-12 w-full min-w-0 items-center justify-center gap-2.5 rounded-full bg-navy px-4 text-[16px] font-medium tracking-[-0.04em] text-white transition hover:brightness-110"
                >
                  <span className="truncate">{cta.label}</span>
                  <ArrowInCircle variant="on-dark" className="h-5 w-5 shrink-0" />
                </Link>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
