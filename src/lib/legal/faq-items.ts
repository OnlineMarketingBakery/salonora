import type { Locale } from "@/lib/i18n/locales";
import {
  FAQ_CATEGORY_ORDER,
  getFaqCategoryLabel,
  type FaqCategoryId,
} from "./faq-categories";
import { faqQuestionMatchesLocale } from "./faq-lang-detect";
import faqData from "./faq-data.json";

export type FaqEntry = {
  id: string;
  category: FaqCategoryId;
  question: string;
  answer: string;
};

export type FaqCategoryGroup = {
  id: FaqCategoryId;
  label: string;
  items: FaqEntry[];
};

const SKIP_QUESTION_RE = /^(meer vragen|more questions)\??$/i;

function filterCatalog(items: FaqEntry[], lang: Locale): FaqEntry[] {
  return items.filter(
    (it) =>
      !SKIP_QUESTION_RE.test(it.question.trim()) && faqQuestionMatchesLocale(it.question, lang)
  );
}

const FAQ_NL = filterCatalog(faqData.nl as FaqEntry[], "nl");
const FAQ_EN = filterCatalog(faqData.en as FaqEntry[], "en");

export function getGlobalFaqItems(lang: Locale): FaqEntry[] {
  return lang === "nl" ? FAQ_NL : FAQ_EN;
}

export function getGlobalFaqTitle(lang: Locale): string {
  return lang === "nl" ? "Veelgestelde vragen" : "Frequently asked questions";
}

export function groupFaqItems(items: FaqEntry[], lang: Locale): FaqCategoryGroup[] {
  const groups: FaqCategoryGroup[] = [];
  for (const id of FAQ_CATEGORY_ORDER) {
    const catItems = items.filter((it) => it.category === id);
    if (catItems.length === 0) continue;
    groups.push({
      id,
      label: getFaqCategoryLabel(id, lang),
      items: catItems,
    });
  }
  return groups;
}

/** Map flat WP FAQ rows onto bundled catalog when possible. */
export function normalizeFaqItemsFromWp(
  wpItems: { question: string; answer: string }[],
  lang: Locale
): FaqEntry[] {
  const catalog = getGlobalFaqItems(lang);
  if (wpItems.length === 0) return catalog;

  const byQuestion = new Map(
    catalog.map((it) => [it.question.trim().toLowerCase(), it])
  );

  const merged: FaqEntry[] = [];
  const seen = new Set<string>();

  for (const row of wpItems) {
    if (SKIP_QUESTION_RE.test(row.question.trim())) continue;
    if (!faqQuestionMatchesLocale(row.question, lang)) continue;
    const key = row.question.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const match = byQuestion.get(key);
    if (match) {
      merged.push({
        ...match,
        answer: row.answer.length > match.answer.length ? row.answer : match.answer,
      });
    } else {
      merged.push({
        id: `wp-${merged.length}`,
        category: "general",
        question: row.question.trim(),
        answer: row.answer,
      });
    }
  }

  return merged.length >= catalog.length * 0.8 ? merged : catalog;
}

export function countFaqItemsInGroups(groups: FaqCategoryGroup[]): number {
  return groups.reduce((sum, g) => sum + g.items.length, 0);
}

export function filterFaqGroups(
  groups: FaqCategoryGroup[],
  query: string
): FaqCategoryGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;

  return groups
    .map((g) => ({
      ...g,
      items: g.items.filter((it) => {
        const text = `${it.question} ${it.answer.replace(/<[^>]+>/g, " ")}`.toLowerCase();
        return text.includes(q);
      }),
    }))
    .filter((g) => g.items.length > 0);
}
