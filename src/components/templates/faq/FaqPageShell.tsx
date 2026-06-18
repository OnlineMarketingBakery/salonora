"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/ui/Container";
import { FaqBreadcrumbs } from "@/components/templates/faq/FaqBreadcrumbs";
import { FaqContactBanner } from "@/components/templates/faq/FaqContactBanner";
import { FaqPageInner } from "@/components/templates/faq/FaqPageColumn";
import { FaqPageAccordion, faqEntriesToAccordionItems } from "@/components/templates/faq/FaqPageAccordion";
import { filterFaqGroups, groupFaqItems, type FaqEntry } from "@/lib/legal/faq-items";
import type { ContactSocialSettings } from "@/types/globals";
import type { Locale } from "@/lib/i18n/locales";

const COPY = {
  nl: {
    searchLabel: "Zoek in veelgestelde vragen",
    searchPlaceholder: "Bijv. prijs, boeken, website…",
    emptyTitle: "Geen resultaten gevonden",
    emptyBody: "Probeer een andere zoekterm of neem contact met ons op.",
    emptyCall: "Bel ons",
    emptyEmail: "Mail ons",
    subtitle: (n: number) =>
      `Alles over Salonora, je salonwebsite en online boekingen — ${n} antwoord${n === 1 ? "" : "en"}, helder en zonder jargon.`,
  },
  en: {
    searchLabel: "Search FAQs",
    searchPlaceholder: "e.g. price, booking, website…",
    emptyTitle: "No results found",
    emptyBody: "Try a different search term or get in touch with our team.",
    emptyCall: "Call us",
    emptyEmail: "Email us",
    subtitle: (n: number) =>
      `Everything about Salonora, your salon website and online booking — ${n} answer${n === 1 ? "" : "s"}, clear and jargon-free.`,
  },
} as const;

function telHref(phone: string): string | null {
  const normalized = phone.replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : null;
}

export function FaqPageShell({
  items,
  lang,
  title,
  contact,
  showHero = true,
}: {
  items: FaqEntry[];
  lang: Locale;
  title: string;
  contact: ContactSocialSettings;
  showHero?: boolean;
}) {
  const copy = COPY[lang];
  const email = contact.mainEmail.trim() || "hi@salonora.eu";
  const phone = contact.mainPhone.trim();
  const phoneHref = phone ? telHref(phone) : null;
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  const groups = useMemo(() => groupFaqItems(items, lang), [items, lang]);
  const filtered = useMemo(() => filterFaqGroups(groups, query), [groups, query]);
  const totalCount = items.length;

  return (
    <div className="faq-page-layout">
      {showHero ? (
        <header className="legal-page-hero faq-page-hero">
          <Container padding="header" className="faq-page-hero-wrap">
            <FaqPageInner className="faq-page-hero-inner">
              <FaqBreadcrumbs lang={lang} />

              <h1 className="mt-3 text-[1.75rem] font-bold leading-tight text-navy-deep sm:text-3xl md:text-[2.125rem]">
                {title}
              </h1>
              <p className="mt-2 text-base leading-[1.7] text-muted md:text-lg">
                {copy.subtitle(totalCount)}
              </p>
            </FaqPageInner>
          </Container>
        </header>
      ) : null}

      <section className="faq-page-main bg-background pb-16 md:pb-20">
        <Container padding="header" className="faq-page-main-wrap pt-4 md:pt-5">
          <FaqPageInner className="faq-page-stack flex flex-col gap-6">
            <div className="faq-page-search w-full min-w-0">
              <label htmlFor="faq-search" className="sr-only">
                {copy.searchLabel}
              </label>
              <div className="relative w-full">
                <span
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand"
                  aria-hidden
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                    <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  id="faq-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={copy.searchPlaceholder}
                  className="faq-page-search-input w-full min-w-0 rounded-2xl border border-[color-mix(in_srgb,var(--palette-brand)_16%,transparent)] bg-white py-3.5 pl-12 pr-4 text-base text-navy-deep outline-none transition-[border-color,box-shadow] placeholder:text-muted/80 focus:border-brand focus:ring-2 focus:ring-brand/20"
                  autoComplete="off"
                />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="faq-page-empty w-full min-w-0 rounded-2xl border border-surface bg-surface/50 px-5 py-10 text-center">
                <p className="text-lg font-semibold text-navy-deep">{copy.emptyTitle}</p>
                <p className="mt-2 text-base leading-[1.7] text-muted">{copy.emptyBody}</p>
                {phoneHref ? (
                  <a
                    href={phoneHref}
                    className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand px-6 text-base font-semibold text-white transition hover:bg-brand-strong sm:w-auto"
                  >
                    {phone || copy.emptyCall}
                  </a>
                ) : (
                  <a
                    href={`mailto:${email}`}
                    className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand px-6 text-base font-semibold text-white transition hover:bg-brand-strong sm:w-auto"
                  >
                    {copy.emptyEmail}
                  </a>
                )}
              </div>
            ) : (
              <div className="faq-page-categories flex w-full min-w-0 flex-col">
                {filtered.map((group) => (
                  <section
                    key={group.id}
                    className="faq-page-category-section w-full min-w-0"
                    aria-labelledby={`faq-cat-${group.id}`}
                  >
                    <h2 id={`faq-cat-${group.id}`} className="faq-page-category-heading">
                      {group.label}
                    </h2>
                    <FaqPageAccordion
                      items={faqEntriesToAccordionItems(group.items)}
                      openId={openId}
                      onToggle={(id) => setOpenId((prev) => (prev === id ? null : id))}
                    />
                  </section>
                ))}
              </div>
            )}

            <div className="faq-page-cta-wrap w-full min-w-0 pt-2 sm:pt-4">
              <FaqContactBanner lang={lang} contact={contact} />
            </div>
          </FaqPageInner>
        </Container>
      </section>
    </div>
  );
}
