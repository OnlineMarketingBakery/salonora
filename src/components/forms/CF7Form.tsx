"use client";

import { useState, useTransition } from "react";
import type { CF7FormDefinition } from "@/types/forms";
import { Button } from "@/components/ui/Button";
import { CF7FieldRenderer } from "./CF7FieldRenderer";

type Props = {
  formId: number;
  definition: CF7FormDefinition | null;
  successMode: "inline" | "redirect";
  redirectUrl?: string;
  trackingContext?: string;
};

export function CF7Form({ formId, definition, successMode, redirectUrl, trackingContext }: Props) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  if (!formId) {
    return <p className="text-sm text-amber-800">No form selected in WordPress.</p>;
  }

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

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(() => {
          void submit(fd);
        });
      }}
    >
      {definition?.fields
        .filter((f) => f.basetype !== "submit")
        .map((f) => (
          <CF7FieldRenderer key={f.name} field={f} />
        ))}
      {(!definition || !definition.fields.length) && (
        <p className="text-sm text-muted">Could not load form fields. Ensure the CF7 REST API is available.</p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "…" : definition?.submitLabel?.trim() || "Send"}
      </Button>
      {message && <p className="text-sm text-emerald-700">{message}</p>}
      {err && <p className="text-sm text-red-700">{err}</p>}
    </form>
  );
}
