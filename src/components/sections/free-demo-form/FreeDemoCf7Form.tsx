"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { CF7FormDefinition, CF7FormField } from "@/types/forms";
import { CF7FieldRenderer } from "@/components/forms/CF7FieldRenderer";

function isWebsiteGateField(f: CF7FormField): boolean {
  if (f.basetype !== "radio" || !f.options?.length) return false;
  const hay = `${f.name} ${f.options.map((o) => `${o.value} ${o.label}`).join(" ")}`.toLowerCase();
  return /\b(website|site|url|heeft|huidige)\b/.test(hay);
}

function isConditionalUrlField(f: CF7FormField, gate: CF7FormField | undefined): boolean {
  if (!gate || f.name === gate.name) return false;
  if (f.basetype === "url") return true;
  return f.basetype === "text" && /\b(url|website|site|link)\b/i.test(f.name);
}

function isTruthyWebsiteChoice(value: string): boolean {
  const v = value.trim().toLowerCase();
  if (!v) return false;
  if (v === "no" || v === "nee" || v === "0" || v === "false") return false;
  return true;
}

function usesFullRow(f: CF7FormField): boolean {
  return (
    f.basetype === "select" ||
    f.basetype === "textarea" ||
    f.basetype === "radio" ||
    f.basetype === "url"
  );
}

type Props = {
  formId: number;
  definition: CF7FormDefinition | null;
  successMode: "inline" | "redirect";
  redirectUrl?: string;
  trackingContext?: string;
};

export function FreeDemoCf7Form({
  formId,
  definition,
  successMode,
  redirectUrl,
  trackingContext,
}: Props) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const fields = useMemo(
    () => (definition?.fields ?? []).filter((f) => f.basetype !== "submit"),
    [definition?.fields]
  );

  const gateField = useMemo(() => fields.find(isWebsiteGateField), [fields]);

  const initialGate = useMemo(() => {
    if (!gateField?.options?.length) return "";
    const yes = gateField.options.find(
      (o) =>
        /^(yes|ja|1|true)$/i.test(o.value.trim()) ||
        /^(yes|ja)$/i.test((o.label || "").trim())
    );
    return yes?.value ?? gateField.options[0]?.value ?? "";
  }, [gateField]);

  const [gateValue, setGateValue] = useState(initialGate);

  useEffect(() => {
    setGateValue(initialGate);
  }, [initialGate]);

  const showUrlFields = !gateField || isTruthyWebsiteChoice(gateValue);

  async function submit(data: FormData) {
    setErr(null);
    setMessage(null);
    if (trackingContext) {
      data.append("tracking_context", trackingContext);
    }
    const res = await fetch(`/api/cf7/${formId}`, { method: "POST", body: data });
    const json = (await res.json()) as { status: string; message: string };
    if (json.status === "mail_sent" || res.ok) {
      setMessage(json.message || "Success");
      if (successMode === "redirect" && redirectUrl) {
        window.location.href = redirectUrl;
      }
    } else {
      setErr(json.message || "Error");
    }
  }

  if (!formId) {
    return <p className="text-sm text-amber-800">No form selected in WordPress.</p>;
  }

  const submitLabel = definition?.submitLabel?.trim() || "Send";

  return (
    <form
      className="mx-auto w-full max-w-[476px]"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(() => {
          void submit(fd);
        });
      }}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {fields.map((field) => {
          if (gateField && isConditionalUrlField(field, gateField) && !showUrlFields) {
            return null;
          }

          if (gateField && field === gateField) {
            return (
              <div key={field.name} className="text-left md:col-span-2">
                <fieldset>
                  <legend className="mb-2 block text-sm font-normal text-muted tracking-tight">
                    {field.name}
                  </legend>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    {(field.options ?? []).map((o) => (
                      <label
                        key={`${field.name}-${o.value}`}
                        className="inline-flex cursor-pointer items-center gap-1.5 text-base font-medium text-navy-deep"
                      >
                        <input
                          type="radio"
                          name={field.name}
                          value={o.value}
                          checked={gateValue === o.value}
                          onChange={() => setGateValue(o.value)}
                          required
                          className="size-3.5 accent-brand"
                        />
                        <span>{o.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            );
          }

          const col = usesFullRow(field) ? "md:col-span-2" : "";
          return (
            <div key={field.name} className={col}>
              <CF7FieldRenderer field={field} variant="free_demo" />
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-5 w-full rounded-xl bg-gradient-to-b from-brand to-accent py-3.5 text-sm font-medium text-white shadow-md shadow-navy-deep/15 transition hover:brightness-[1.03] disabled:opacity-60"
      >
        {pending ? "…" : submitLabel}
      </button>
      {message && <p className="mt-3 text-center text-sm text-emerald-700">{message}</p>}
      {err && <p className="mt-3 text-center text-sm text-red-700">{err}</p>}
      {(!definition || !definition.fields.length) && (
        <p className="mt-4 text-sm text-muted">Could not load form fields. Ensure the CF7 REST API is available.</p>
      )}
    </form>
  );
}
