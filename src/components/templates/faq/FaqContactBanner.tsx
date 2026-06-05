import Link from "next/link";
import type { ContactSocialSettings } from "@/types/globals";
import type { Locale } from "@/lib/i18n/locales";

const COPY = {
  nl: {
    title: "Nog vragen?",
    text: "We reageren doorgaans dezelfde werkdag.",
    emailLabel: "Mail ons",
    phoneFallbackLabel: "Bel ons",
  },
  en: {
    title: "More questions?",
    text: "We usually reply the same business day.",
    emailLabel: "Email us",
    phoneFallbackLabel: "Call us",
  },
} as const;

const FALLBACK_EMAIL = "hoi@salonora.nl";

const BTN_CLASS =
  "faq-cta-btn inline-flex min-h-12 w-full flex-1 items-center justify-center rounded-full bg-white px-5 text-base font-semibold text-slate-900 shadow-[0_8px_24px_-6px_rgba(21,41,81,0.35)] transition hover:brightness-[0.98]";

function telHref(phone: string): string | null {
  const normalized = phone.replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : null;
}

export function FaqContactBanner({
  lang,
  contact,
}: {
  lang: Locale;
  contact: ContactSocialSettings;
}) {
  const copy = COPY[lang];
  const email = contact.mainEmail.trim() || FALLBACK_EMAIL;
  const phone = contact.mainPhone.trim();
  const phoneHref = phone ? telHref(phone) : null;
  const phoneLabel = phone || copy.phoneFallbackLabel;

  return (
    <aside className="faq-contact-banner w-full" aria-label={copy.title}>
      <div className="flex w-full flex-col items-center gap-6 rounded-2xl bg-linear-to-br from-brand to-brand-strong px-5 py-10 text-center text-white shadow-[0_16px_48px_-14px_rgba(21,41,81,0.35)] sm:px-10 sm:py-12">
        <div className="flex max-w-lg flex-col items-center gap-2">
          <h2 className="flex items-center justify-center gap-3 text-2xl font-semibold leading-tight sm:text-3xl">
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25"
              aria-hidden
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 7h16v10H4V7zm2 2 6 4 6-4"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>{copy.title}</span>
          </h2>
          <p className="text-base font-medium leading-relaxed text-white/90 sm:text-lg">{copy.text}</p>
        </div>

        <div
          className={`faq-cta-actions grid w-full grid-cols-1 gap-3 ${phoneHref ? "sm:grid-cols-2" : ""}`}
        >
          <Link href={`mailto:${email}`} className={BTN_CLASS}>
            {copy.emailLabel}
          </Link>
          {phoneHref ? (
            <Link href={phoneHref} className={BTN_CLASS}>
              {phoneLabel}
            </Link>
          ) : null}
        </div>

        <p className="text-sm font-medium text-white/85">
          <a href={`mailto:${email}`} className="underline-offset-2 hover:underline">
            {email}
          </a>
        </p>
      </div>
    </aside>
  );
}
