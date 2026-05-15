"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/locales";
import { Input } from "@/components/ui/Input";
import { getFreeDemoFormCopy, type SalonTypeSlug } from "./copy";

/**
 * Figma **696:4148** — 12px radius, 50px field height, #ebf3fe fill (`bg-surface`),
 * label 14px Outfit #435780 (`text-muted`), tracking −0.28px, label↔field gap 10px,
 * value text 16px medium #002752 (`text-navy-deep`).
 */
const fieldShellClass =
  "flex h-[50px] w-full min-h-[50px] items-center rounded-[12px] !border-0 !bg-surface px-4 text-base font-medium leading-[1.54] tracking-[-0.02em] text-navy-deep shadow-none outline-none ring-0 placeholder:text-muted/30 focus:!border-0 focus:ring-2 focus:ring-brand/35 [&:-webkit-autofill]:[-webkit-text-fill-color:var(--palette-navy-deep)] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_var(--palette-surface)]";

const labelClass =
  "block w-full text-left text-sm font-normal leading-[1.54] tracking-[-0.02em] text-muted";

const salonSlugs: SalonTypeSlug[] = ["hair", "beauty", "barber", "nails", "other"];

type Props = {
  lang: Locale;
  ombFormId: number;
  successMode: "inline" | "redirect";
  redirectUrl?: string;
  trackingContext: string;
};

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden>
      <path
        d="M4.25 6.375L8.5 10.625L12.75 6.375"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FreeDemoLeadForm({ lang, ombFormId, successMode, redirectUrl, trackingContext }: Props) {
  const c = getFreeDemoFormCopy(lang);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [hasWebsite, setHasWebsite] = useState<"yes" | "no">("yes");

  async function submit(payload: Record<string, string | number>) {
    setErr(null);
    setMessage(null);
    let res: Response;
    try {
      res = await fetch("/api/forms/free-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...payload,
          lang,
          tracking_context: trackingContext || undefined,
        }),
      });
    } catch {
      setErr(c.errorGeneric);
      return;
    }
    const raw = await res.text();
    let json: { ok?: boolean; message?: string; redirect_url?: string } = {};
    try {
      json = raw ? (JSON.parse(raw) as typeof json) : {};
    } catch {
      setErr(!res.ok ? raw.slice(0, 280).trim() || c.errorGeneric : c.errorGeneric);
      return;
    }
    const success = res.ok && json.ok !== false;
    if (success) {
      setMessage((json.message && json.message.trim()) || c.successDefault);
      if (successMode === "redirect") {
        const target = (json.redirect_url && json.redirect_url.trim()) || redirectUrl;
        if (target) window.location.href = target;
      }
    } else {
      setErr((json.message && json.message.trim()) || c.errorGeneric);
    }
  }

  if (!ombFormId) {
    return <p className="text-center text-sm text-amber-800">{c.formNotConfigured}</p>;
  }

  const stackLabel = `${labelClass} flex min-w-0 flex-col gap-2.5`;

  return (
    <form
      className="mx-auto w-full max-w-[476px] text-left"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }
        const fd = new FormData(form);
        const company = String(fd.get("company") ?? "").trim();
        if (company) return;
        const first_name = String(fd.get("first_name") ?? "").trim();
        const last_name = String(fd.get("last_name") ?? "").trim();
        const email = String(fd.get("email") ?? "").trim();
        const phone = String(fd.get("phone") ?? "").trim();
        const salon_type = String(fd.get("salon_type") ?? "").trim();
        const website_url = hasWebsite === "yes" ? String(fd.get("website_url") ?? "").trim() : "";
        setIsSubmitting(true);
        void submit({
          omb_form_id: ombFormId,
          first_name,
          last_name,
          email,
          phone,
          salon_type,
          has_website: hasWebsite,
          website_url,
        }).finally(() => {
          setIsSubmitting(false);
        });
      }}
    >
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden />

      <div className="flex w-full flex-col gap-5">
        <div className="grid w-full grid-cols-1 gap-x-3 gap-y-5 md:grid-cols-2">
          <Input
            name="first_name"
            label={c.firstName}
            labelClassName={stackLabel}
            stackedLabel
            required
            autoComplete="given-name"
            className={fieldShellClass}
          />
          <Input
            name="last_name"
            label={c.lastName}
            labelClassName={stackLabel}
            stackedLabel
            required
            autoComplete="family-name"
            className={fieldShellClass}
          />
        </div>
        <div className="grid w-full grid-cols-1 gap-x-3 gap-y-5 md:grid-cols-2">
          <Input
            name="email"
            type="email"
            label={c.email}
            labelClassName={stackLabel}
            stackedLabel
            required
            autoComplete="email"
            className={fieldShellClass}
          />
          <Input
            name="phone"
            type="tel"
            label={c.phone}
            labelClassName={stackLabel}
            stackedLabel
            autoComplete="tel"
            className={fieldShellClass}
          />
        </div>

        <label className={`${stackLabel}`}>
          <span>{c.salonType}</span>
          <div className="relative min-w-0">
            <select
              name="salon_type"
              required
              defaultValue="hair"
              className={`${fieldShellClass} w-full appearance-none pr-14 font-medium`}
            >
              {salonSlugs.map((slug) => (
                <option key={slug} value={slug}>
                  {c.salonOptions[slug]}
                </option>
              ))}
            </select>
            <span
              className="pointer-events-none absolute right-3 top-1/2 flex size-[27px] -translate-y-1/2 items-center justify-center rounded-[13.5px] bg-white p-[5px] text-muted shadow-[0_1px_3px_color-mix(in_srgb,var(--palette-navy)_8%,transparent)]"
              aria-hidden
            >
              <ChevronDownIcon className="size-[17px] shrink-0" />
            </span>
          </div>
        </label>

        <fieldset className="w-full min-w-0 text-left">
          <legend className={`${labelClass} mb-2.5`}>{c.hasWebsiteQuestion}</legend>
          <div className="flex flex-wrap items-center gap-x-[11px] gap-y-2">
            <label className="inline-flex cursor-pointer items-center gap-1 text-base font-medium leading-[1.54] tracking-[-0.02em] text-navy-deep">
              <input
                type="radio"
                name="has_website_ui"
                checked={hasWebsite === "yes"}
                onChange={() => setHasWebsite("yes")}
                className="size-[14px] accent-brand"
              />
              <span>{c.yes}</span>
            </label>
            <label className="inline-flex cursor-pointer items-center gap-1 text-base font-medium leading-[1.54] tracking-[-0.02em] text-navy-deep">
              <input
                type="radio"
                name="has_website_ui"
                checked={hasWebsite === "no"}
                onChange={() => setHasWebsite("no")}
                className="size-[14px] accent-brand"
              />
              <span>{c.no}</span>
            </label>
          </div>
        </fieldset>

        {hasWebsite === "yes" ? (
          <Input
            name="website_url"
            type="text"
            inputMode="url"
            label={c.websiteUrl}
            labelClassName={stackLabel}
            stackedLabel
            placeholder={c.websitePlaceholder}
            autoComplete="url"
            className={`${fieldShellClass} font-normal placeholder:font-normal`}
          />
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-[50px] w-full items-center justify-center rounded-[12px] bg-gradient-to-b from-brand to-brand-strong text-sm font-medium leading-[1.54] text-white shadow-[0_6px_20px_color-mix(in_srgb,var(--palette-brand)_35%,transparent)] transition hover:brightness-[1.03] disabled:opacity-60"
        >
          {isSubmitting ? c.sending : c.submit}
        </button>
      </div>

      {message && <p className="mt-5 text-center text-sm text-emerald-700">{message}</p>}
      {err && <p className="mt-5 text-center text-sm text-red-700">{err}</p>}
    </form>
  );
}
