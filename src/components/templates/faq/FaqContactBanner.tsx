import { ContactCtaPill } from "@/components/sections/faq-contact-split/ContactCtaPill";
import type { ContactSocialSettings } from "@/types/globals";
import type { Locale } from "@/lib/i18n/locales";

const COPY = {
  nl: {
    title: "Nog vragen?",
    subtitle: "Stel je vraag!",
    messageCta: "Stuur een bericht",
    callCta: "Plan een gesprek",
  },
  en: {
    title: "More questions?",
    subtitle: "Ask your question!",
    messageCta: "Send a message",
    callCta: "Schedule a call",
  },
} as const;

const FALLBACK_EMAIL = "hoi@salonora.nl";

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
  const phoneHref = contact.mainPhone.trim() ? telHref(contact.mainPhone) : null;

  return (
    <aside className="faq-contact-banner w-full" aria-label={copy.title}>
      <div className="faq-split-contact-card flex w-full min-w-0 flex-col items-center justify-center gap-6 rounded-[14px] bg-gradient-to-b from-brand to-[#0569d7] p-8 shadow-[0_14px_40px_-12px_rgba(21,41,81,0.18)] sm:p-10 md:p-11">
        <div className="flex w-full min-w-0 max-w-[401px] flex-col items-center gap-6 text-center text-white">
          <h2 className="w-full text-[32px] font-medium leading-tight sm:text-[40px] sm:leading-[47px]">
            {copy.title}
          </h2>
          <p className="w-full text-lg font-semibold leading-[1.2] text-white sm:text-2xl">
            {copy.subtitle}
          </p>

          <div className="flex w-full min-w-0 flex-col items-stretch gap-4">
            <ContactCtaPill
              href={`mailto:${email}`}
              text={copy.messageCta}
              icon={null}
              iconFallback="mail"
            />
            {phoneHref ? (
              <ContactCtaPill
                href={phoneHref}
                text={copy.callCta}
                icon={null}
                iconFallback="phone"
              />
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}
