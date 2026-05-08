import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { TeamBehindSalonoraSectionT } from "@/types/sections";
import Image from "next/image";

const DEFAULT_BG_OVERLAY_SRC = "/team-behind-salonora/bg.png";
const DEFAULT_WORDMARK_SRC = "/team-behind-salonora/the-team.svg";
const DEFAULT_VECTOR_TOP_RIGHT_SRC =
  "/team-behind-salonora/vector-top-right.svg";
const DEFAULT_VECTOR_BOTTOM_LEFT_SRC =
  "/team-behind-salonora/vector-bottom-left.svg";
const DEFAULT_LINES_TOP_LEFT_SRC = "/team-behind-salonora/lines-top-left.svg";
const DEFAULT_LINES_BOTTOM_RIGHT_SRC =
  "/team-behind-salonora/lines-bottom-right.svg";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ?? "h-6 w-6"}
      fill="currentColor"
      aria-hidden
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ?? "h-6 w-6"}
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ?? "h-6 w-6"}
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function SocialButton({
  href,
  label,
  accent,
  children,
}: {
  href: string;
  label: string;
  accent: "brand" | "rose";
  children: React.ReactNode;
}) {
  const bg = accent === "rose" ? "var(--palette-rose)" : "var(--palette-brand)";
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className={`${REVEAL_ITEM} inline-flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-full text-white transition [box-shadow:0_10px_22px_color-mix(in_srgb,var(--palette-navy)_22%,transparent)] hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 max-md:size-11 md:h-10 md:w-10 md:min-h-0 md:min-w-0`}
      style={{ backgroundColor: bg }}
    >
      {children}
    </a>
  );
}

function MemberCard({
  member,
  lang,
}: {
  member: TeamBehindSalonoraSectionT["members"][number];
  lang: Locale;
}) {
  const accent = member.accent ?? "brand";
  const bg = accent === "rose" ? "var(--palette-rose)" : "var(--palette-brand)";

  const socials = [
    member.facebook && {
      kind: "Facebook" as const,
      r: resolveLink(member.facebook, lang),
    },
    member.instagram && {
      kind: "Instagram" as const,
      r: resolveLink(member.instagram, lang),
    },
    member.linkedin && {
      kind: "LinkedIn" as const,
      r: resolveLink(member.linkedin, lang),
    },
  ]
    .map((x) =>
      x?.r ? { kind: x.kind, href: x.r.href, target: x.r.target } : null,
    )
    .filter(Boolean) as {
    kind: "Facebook" | "Instagram" | "LinkedIn";
    href: string;
    target?: string | null;
  }[];

  const socialRow =
    socials.length > 0 ? (
      <div className="flex flex-wrap justify-center gap-[13px] md:justify-start md:gap-2">
        {socials.slice(0, 3).map((s) => {
          const icon =
            s.kind === "Facebook" ? (
              <FacebookIcon className="h-[22px] w-[22px] md:h-5 md:w-5" />
            ) : s.kind === "Instagram" ? (
              <InstagramIcon className="h-[22px] w-[22px] md:h-5 md:w-5" />
            ) : (
              <LinkedinIcon className="h-[22px] w-[22px] md:h-5 md:w-5" />
            );
          return (
            <SocialButton
              key={s.kind}
              href={s.href}
              label={s.kind}
              accent={accent}
            >
              {icon}
            </SocialButton>
          );
        })}
      </div>
    ) : null;

  return (
    <div className="relative flex w-full flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_18px_44px_color-mix(in_srgb,var(--palette-muted)_18%,transparent)] md:block md:h-[340px]">
      {/* Photo section: circular crop on mobile, original rectangle on desktop */}
      <div className="relative order-1 flex shrink-0 flex-col items-center pt-5 md:pointer-events-none md:absolute md:order-0 md:bottom-0 md:right-0 md:h-full md:w-[263px] md:justify-end md:pt-0">
        <div className="relative mx-auto max-w-full shrink-0 max-md:flex max-md:h-[180px] max-md:w-[180px] max-md:items-center max-md:justify-center md:mx-0 md:h-full md:w-[min(100%,263px)]">
          {/* Orb: larger than photo on mobile so it peeks out as a soft ring */}
          <div
            className="absolute rounded-full opacity-30 max-md:left-1/2 max-md:top-1/2 max-md:h-[200px] max-md:w-[200px] max-md:-translate-x-1/2 max-md:-translate-y-1/2 md:bottom-0 md:left-auto md:right-[-6px] md:top-auto md:mb-[-85px] md:mr-[-15px] md:h-[250px] md:w-[250px] md:translate-x-0 md:translate-y-0"
            style={{ backgroundColor: bg }}
            aria-hidden
          />
          {/* Photo: circular on mobile, original rectangle on desktop */}
          <div className="absolute overflow-hidden max-md:left-1/2 max-md:top-1/2 max-md:h-[168px] max-md:w-[168px] max-md:-translate-x-1/2 max-md:-translate-y-1/2 max-md:rounded-full md:bottom-0 md:left-auto md:right-0 md:top-auto md:h-[286px] md:w-[255px] md:translate-x-0 md:translate-y-0 md:rounded-br-[14px] md:rounded-tl-none md:rounded-tr-none md:rounded-bl-none">
            {member.photo ? (
              <Media
                image={member.photo}
                fill
                preferLargestSource
                className="object-cover object-top"
                sizes="(max-width: 767px) 168px, 255px"
              />
            ) : null}
          </div>
        </div>
      </div>

      {/* ▼ MOBILE FIX 5: Reduced top padding from pt-4 → pt-2 and bottom padding from pb-6 → pb-5 */}
      <div className="relative z-10 order-2 px-6 pb-5 pt-2 text-center md:absolute md:inset-0 md:order-0 md:text-left md:px-[38px] md:pb-0 md:pl-[38px] md:pr-[200px] md:pt-[38px]">
        <div className="flex flex-col md:h-full">
          <div className="min-w-0 max-md:mx-auto max-md:max-w-[40ch] md:text-left">
            {/* ▼ MOBILE FIX 6: Name clamped tighter 20px–22px on mobile */}
            <h3
              className={`${REVEAL_ITEM} text-[clamp(20px,5vw,22px)] font-semibold leading-snug tracking-[-0.04em] text-navy md:text-[36px] md:leading-[56px]`}
            >
              {member.name}
            </h3>
            {member.bio && (
              <RichText
                html={member.bio}
                className={`${REVEAL_ITEM} mt-1.5 text-sm leading-normal text-muted max-md:[&_li]:text-[13px] max-md:[&_li]:leading-snug max-md:[&_p]:text-[13px] max-md:[&_p]:leading-snug [&_p]:m-0! [&_p+_p]:mt-1.5! md:mt-[11px] md:text-base md:leading-[1.6] md:[&_li]:text-base md:[&_p]:text-base md:[&_p]:leading-[1.6]`}
              />
            )}
          </div>

          {/* ▼ MOBILE FIX 7: Reduced social row top margin from mt-6 → mt-4 on mobile */}
          <div className="mt-8 max-md:mt-4 md:mt-auto md:pb-[38px]">
            {socialRow}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TeamBehindSalonoraSection({
  section,
  lang,
}: {
  section: TeamBehindSalonoraSectionT;
  lang: Locale;
}) {
  const title = section.title?.trim() || "Het Team Achter Salonora";
  return (
    <section className="relative overflow-hidden bg-navy-deep py-20 text-white sm:py-24 md:py-28">
      {/* Background stack (must be ABOVE section background paint) */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {section.backgroundOverlay ? (
          <div className="absolute inset-0">
            <Media
              image={section.backgroundOverlay}
              fill
              preferLargestSource
              className="object-cover"
              sizes="100vw"
            />
          </div>
        ) : (
          <Image
            src={DEFAULT_BG_OVERLAY_SRC}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority={false}
          />
        )}
      </div>

      {/* Figma overlays for `597:2404`: corner vectors + line gradients.
          Render by default; allow optional CMS overrides for each layer. */}
      <div className="pointer-events-none absolute right-0 top-0 z-0 h-[418px] w-[358px] opacity-80">
        {section.cornerTopRight ? (
          <Media
            image={section.cornerTopRight}
            width={358}
            height={418}
            preferLargestSource
            className="h-full w-full object-contain"
            sizes="358px"
          />
        ) : (
          <Image
            src={DEFAULT_VECTOR_TOP_RIGHT_SRC}
            alt=""
            fill
            className="object-contain"
            sizes="358px"
            priority={false}
          />
        )}
      </div>
      {/* Figma `597:2716` is the bottom-left corner grid element. */}
      <div className="pointer-events-none absolute bottom-0 left-0 z-0 h-[418px] w-[358px] rotate-180 opacity-80">
        {section.cornerBottomLeft ? (
          <Media
            image={section.cornerBottomLeft}
            width={358}
            height={418}
            preferLargestSource
            className="h-full w-full object-contain"
            sizes="358px"
          />
        ) : (
          <Image
            src={DEFAULT_VECTOR_BOTTOM_LEFT_SRC}
            alt=""
            fill
            className="object-contain"
            sizes="358px"
            priority={false}
          />
        )}
      </div>
      <div className="pointer-events-none absolute left-0 top-0 z-0 h-[64px] w-[603px] opacity-60">
        {section.cornerLinesTopLeft ? (
          <Media
            image={section.cornerLinesTopLeft}
            width={603}
            height={64}
            preferLargestSource
            className="h-full w-full object-contain"
            sizes="603px"
          />
        ) : (
          <Image
            src={DEFAULT_LINES_TOP_LEFT_SRC}
            alt=""
            fill
            className="object-contain"
            sizes="603px"
            priority={false}
          />
        )}
      </div>
      <div className="pointer-events-none absolute bottom-0 right-0 z-0 h-[64px] w-[603px] rotate-180 opacity-60">
        {section.cornerLinesBottomRight ? (
          <Media
            image={section.cornerLinesBottomRight}
            width={603}
            height={64}
            preferLargestSource
            className="h-full w-full object-contain"
            sizes="603px"
          />
        ) : (
          <Image
            src={DEFAULT_LINES_BOTTOM_RIGHT_SRC}
            alt=""
            fill
            className="object-contain"
            sizes="603px"
            priority={false}
          />
        )}
      </div>

      {/* Figma wordmark `597:2719` is subtle but clearly visible; avoid double-dimming (SVG already has low-opacity gradient). */}
      <div className="pointer-events-none absolute left-1/2 top-10 z-0 w-[min(1201px,92vw)] -translate-x-1/2 opacity-60 sm:top-8">
        {section.backgroundWordmark ? (
          <Media
            image={section.backgroundWordmark}
            width={1400}
            height={220}
            preferLargestSource
            className="h-auto w-full object-contain"
            sizes="(min-width: 1024px) 1201px, 92vw"
          />
        ) : (
          <Image
            src={DEFAULT_WORDMARK_SRC}
            alt=""
            width={1201}
            height={191}
            className="h-auto w-full object-contain"
            priority={false}
            unoptimized
          />
        )}
      </div>

      <Container>
        <div className="relative z-10 mx-auto w-full max-w-[1080px]">
          <h2
            className={`${REVEAL_ITEM} text-center text-[34px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[40px] md:text-[48px] md:leading-[56px]`}
          >
            {title}
          </h2>

          <div className="mt-11 grid gap-6 md:grid-cols-2 md:gap-6">
            {(section.members ?? []).slice(0, 4).map((m, idx) => (
              <MemberCard
                key={`${section.id}-m-${idx}`}
                member={m}
                lang={lang}
              />
            ))}
          </div>

          {/* Gradient border: full opacity at top, fades toward bottom (Figma).
              Implemented as a wrapper so border radius stays perfectly rectangular. */}
          <div
            className="mt-6 rounded-[20px] p-1"
            style={{
              background: [
                "linear-gradient(to bottom,",
                "rgb(from var(--palette-brand) r g b / 1) 0%,",
                "rgb(from var(--palette-brand) r g b / 0.55) 42%,",
                "rgb(from var(--palette-brand) r g b / 0.08) 100%)",
              ].join(" "),
              boxShadow: [
                "0 0 0 1px rgb(from var(--palette-brand) r g b / 0.55)",
                "0 0 28px rgb(from var(--palette-brand) r g b / 0.28)",
              ].join(", "),
            }}
          >
            <div
              className="rounded-[16px] px-8 py-8 text-center sm:px-12"
              style={{
                backgroundColor:
                  "color-mix(in_srgb,var(--palette-navy-deep)_84%,transparent)",
                boxShadow: [
                  "inset 0 0 22px rgb(from var(--palette-brand) r g b / 0.10)",
                  "0 18px 44px color-mix(in_srgb,var(--palette-navy)_28%,transparent)",
                ].join(", "),
              }}
            >
              <RichText
                html={
                  section.bottomText?.trim() ||
                  "Ons team van salon-specialisten Die alleen websites en marketing tools voor salons maken.<br/>Geen bakkers. Geen advocaten. Alleen voor salons!"
                }
                className={`${REVEAL_ITEM} text-lg leading-[1.6] text-white sm:text-xl md:text-2xl [&_p]:m-0! [&_p+_p]:mt-2!`}
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
