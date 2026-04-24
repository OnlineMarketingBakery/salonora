import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Accordion } from "@/components/ui/Accordion";
import { PrimaryCtaLink } from "@/components/ui/PrimaryCtaLink";
import { ArrowInCircle } from "@/components/ui/ArrowInCircle";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { resolveLink } from "@/lib/utils/links";
import { CF7Form } from "@/components/forms/CF7Form";
import type { FaqContactSplitSectionT } from "@/types/sections";
import type { WpImage } from "@/types/wordpress";
import type { Locale } from "@/lib/i18n/locales";

function MailGlyph({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16v10H4V7zm0 0 8 5 8-5"
        stroke="white"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneGlyph({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8.5 4.5C8 4 6.5 3 4.5 5.5L6 7c.5.5.5 1.5 0 2.5-1.5 3-1 3.5 0L11 16c.5.5 1.5.5 2.5-1.5L15 19c-2.5 2-4-1-4-1-1-2-1-2.5h0c0-.5-1-2-1.5-2.5-1.5-1-2.5-2.5-3.5-3-2.5-2-4.5-3.5-6.5-5-2-2-2.5-3-2-4v0z"
        stroke="white"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ContactCtaPill({ href, text, icon, iconFallback, target }: { href: string; text: string; icon: WpImage | null; iconFallback: "mail" | "phone"; target?: string }) {
  return (
    <Link
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      className="flex h-[74px] w-full min-w-0 max-w-full items-center gap-[9px] rounded-[49px] bg-gradient-to-b from-white to-white/70 p-3 drop-shadow-[0px_11px_11.2px_#2463a9] transition hover:brightness-[0.99]"
    >
      <span className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[25px] bg-brand text-white">
        {icon ? (
          <Media image={icon} width={28} height={28} className="h-7 w-7 object-contain" preferLargestSource quality={90} />
        ) : (
          (iconFallback === "mail" ? <MailGlyph className="h-7 w-7" /> : <PhoneGlyph className="h-7 w-7" />)
        )}
      </span>
      <span className="min-w-0 flex-1 text-pretty text-xl font-semibold leading-[1.1] tracking-[-0.8px] text-slate-900 [text-align:left]">
        {text}
      </span>
    </Link>
  );
}

export function FaqContactSplitSection({ section, lang }: { section: FaqContactSplitSectionT; lang: Locale }) {
  const accItems = section.items.map((q, i) => ({
    id: `faq-${i}`,
    title: q.question,
    content: q.answer,
  }));
  const cardTitleLines = section.cardTitle
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-white">
      <Container className="!max-w-[85rem]">
        <div className="mx-auto flex w-full max-w-[1156px] flex-col items-center gap-10 md:gap-[47px]">
          {section.title && (
            <h2 className="w-full text-center text-[40px] font-bold leading-tight tracking-[-0.04em] text-navy-deep sm:text-[48px] sm:leading-[56px]">
              {section.title.split(/\r?\n+/).map((line, i) => {
                const t = line.trim();
                if (!t) return null;
                return (
                  <span key={i} className="block">
                    {t}
                  </span>
                );
              })}
            </h2>
          )}

          {section.intro && (
            <div className="w-full text-center text-muted">
              <RichText html={section.intro} className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:text-center !prose-p:leading-normal" />
            </div>
          )}

          <div className="flex w-full flex-col items-stretch gap-8 lg:flex-row lg:items-start lg:gap-[29px]">
            <div className="flex w-full min-w-0 flex-1 flex-col gap-6 lg:max-w-[638px]">
              <Accordion items={accItems} variant="split" />

              {section.pricingCtas.length > 0 && (
                <div className="flex w-full min-w-0 flex-col gap-[14px]">
                  {section.pricingCtas.map((c, i) => {
                    const l = resolveLink(c.link, lang);
                    if (!l?.href) return null;
                    const t = c.text || l?.label;
                    if (i === 0) {
                      return (
                        <PrimaryCtaLink
                          key={i}
                          href={l.href}
                          target={l.target}
                          className="!h-12 w-full !min-h-0 !max-w-full !justify-between !rounded-[24px] !px-3 !shadow-none"
                        >
                          {t}
                        </PrimaryCtaLink>
                      );
                    }
                    if (i === 1) {
                      return (
                        <Link
                          key={i}
                          href={l.href}
                          target={l.target}
                          rel={l.target === "_blank" ? "noopener noreferrer" : undefined}
                          className="inline-flex h-12 w-full min-w-0 max-w-full items-center justify-between gap-2 rounded-[24px] bg-navy px-3 text-base font-medium text-white transition hover:bg-navy/95"
                        >
                          <span className="min-w-0 break-words text-balance [text-align:left] sm:whitespace-nowrap">{t}</span>
                          <ArrowInCircle variant="on-dark" className="!h-6 !w-6 shrink-0" />
                        </Link>
                      );
                    }
                    return (
                      <Button key={i} href={l.href} variant="secondary" target={l.target} className="h-12 w-full max-w-full rounded-3xl">
                        {t}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="w-full min-w-0 shrink-0 lg:w-[min(100%,489px)] lg:max-w-[489px]">
              {section.useForm && (section.defaultFormId || section.customForm?.id) ? (
                <div
                  className="flex min-h-[400px] flex-col justify-center rounded-[14px] bg-gradient-to-b from-brand to-[#0569d7] p-8 sm:p-11"
                  data-testid="faq-split-form"
                >
                  <div className="w-full min-w-0 max-w-lg rounded-2xl bg-white/95 p-4 shadow-lg sm:p-6">
                    <CF7Form
                      formId={section.defaultFormId || section.customForm?.id || 0}
                      definition={section.formDefinition}
                      successMode="inline"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex min-h-0 w-full min-w-0 flex-col items-center justify-center gap-6 rounded-[14px] bg-gradient-to-b from-brand to-[#0569d7] p-8 sm:min-h-[520px] md:min-h-[580px] lg:min-h-[609px] lg:gap-6 lg:p-[44px]">
                  <div className="flex w-full min-w-0 max-w-[401px] flex-col items-center gap-6 text-center text-white">
                    {cardTitleLines.length > 0 && (
                      <h3 className="w-full text-[40px] font-bold leading-[47px] tracking-[-0.04em] sm:text-[48px] sm:leading-[47px] sm:tracking-[-0.04em]">
                        {cardTitleLines.map((line, i) => (
                          <span key={i} className="block [text-wrap:balance]">
                            {line}
                          </span>
                        ))}
                      </h3>
                    )}
                    {section.cardText && (
                      <RichText
                        html={section.cardText}
                        className="w-full !prose-p:mb-0 !prose-p:mt-0 !prose-p:text-center !prose-p:text-2xl !prose-p:font-semibold !prose-p:leading-[1.2] !prose-p:tracking-[-0.04em] !prose-p:text-white"
                      />
                    )}
                    {section.contactCtas.length > 0 && (
                      <div className="mt-0 flex w-full min-w-0 flex-col items-stretch gap-4">
                        {section.contactCtas.map((c, i) => {
                          const l = resolveLink(c.ctaLink, lang);
                          if (!l?.href) return null;
                          return (
                            <ContactCtaPill
                              key={i}
                              href={l.href}
                              text={c.ctaText || l?.label}
                              icon={c.icon}
                              target={l.target}
                              iconFallback={i % 2 === 0 ? "mail" : "phone"}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
