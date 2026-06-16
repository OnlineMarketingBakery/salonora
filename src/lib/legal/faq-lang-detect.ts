import type { Locale } from "@/lib/i18n/locales";

export type FaqDetectedLang = Locale | "unknown";

/** Heuristic language tag for FAQ question text (harvest + catalog guard). */
export function detectFaqLanguage(question: string): FaqDetectedLang {
  const q = question.trim();
  if (!q) return "unknown";

  if (/^(how |do |does |can |what |will |are |have |who |why |is there |is the |is this |is it )/i.test(q)) {
    return "en";
  }
  if (
    /^(hoe |wat |kan |moet |zijn |werkt |blijven|kost |waarom|kunnen|proberen|bellen |welke |ik heb|ik ben|is er )/i.test(
      q
    )
  ) {
    return "nl";
  }
  if (/^is (er|dit|de|het|salonora|deze|een )/i.test(q)) return "nl";
  if (/^is /i.test(q)) return "en";

  if (/^i (already|am |do not|don'?t |have |need |want )/i.test(q)) return "en";
  if (/per month\b/i.test(q)) return "en";
  if (/per maand\b/i.test(q)) return "nl";

  const dutchRe =
    /\b(je|jouw|wij|niet|voor|het|een|jullie|hebben|deze|kappers|salon|boekingsmodule|instellen|minimale|looptijd|behandelingen|technisch|onderlegd|bellen|proberen|volledig|gratis|daarna|geen|maar|bij|naar|ons|dan|ook|wel|als|zijn|kan|moet|maand|goedkoop|klinkt|certificaten|behandeling|komen|werkt|mobiele|pedicure|wimpers|barbiers|medische|cosmetische)\b/gi;
  const englishRe =
    /\b(the|you|your|we|are|not|for|how|what|can|will|do|does|is|our|they|this|that|with|from|have|would|could|should|booking|demo|free|technical|contract|minimum|treatment|stylist|straight|afterwards|without|month|cheap|sounds|really|good|certificates|works|mobile|pedicurist|barbers|medical|cosmetic)\b/gi;

  const d = (q.match(dutchRe) || []).length;
  const e = (q.match(englishRe) || []).length;
  if (d > e + 1) return "nl";
  if (e > d + 1) return "en";
  return "unknown";
}

/** Keep catalog rows on the correct locale page; drop clearly wrong-language items. */
export function faqQuestionMatchesLocale(question: string, lang: Locale): boolean {
  const detected = detectFaqLanguage(question);
  if (detected === "unknown") return true;
  return detected === lang;
}
