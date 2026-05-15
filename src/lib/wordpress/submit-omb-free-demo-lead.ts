import { logger } from "@/lib/utils/logger";
import type { Locale } from "@/lib/i18n/locales";
import { getOmbFormBuilderHeadlessSubmitSecret, getWordpressApiUrl } from "./config";
import { fetchGlobals } from "./fetch-globals";

/** Internal payload; mapped to CFB field **`id`** keys (`field_1`, …) via the published form schema (`name` → `id`). */
export type FreeDemoLeadPayload = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  salon_type: string;
  has_website: "yes" | "no";
  website_url: string;
  lang: string;
  tracking_context?: string;
};

export type FreeDemoLeadSubmitInput = FreeDemoLeadPayload & {
  omb_form_id: number;
};

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export function validateFreeDemoLeadPayload(
  body: unknown
): { ok: true; data: FreeDemoLeadSubmitInput } | { ok: false; message: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Invalid body" };
  }
  const o = body as Record<string, unknown>;
  const hp = typeof o.omb_hp_check === "string" ? o.omb_hp_check.trim() : "";
  if (hp) {
    return { ok: false, message: "Invalid body" };
  }

  const ombRaw = o.omb_form_id;
  const omb_form_id =
    typeof ombRaw === "number" && Number.isFinite(ombRaw) && ombRaw > 0
      ? Math.floor(ombRaw)
      : typeof ombRaw === "string" && /^\d+$/.test(ombRaw.trim())
        ? Math.floor(Number(ombRaw.trim()))
        : 0;
  if (omb_form_id <= 0) {
    return { ok: false, message: "omb_form_id is required" };
  }

  const first_name = typeof o.first_name === "string" ? o.first_name.trim().slice(0, 120) : "";
  const last_name = typeof o.last_name === "string" ? o.last_name.trim().slice(0, 120) : "";
  const email = typeof o.email === "string" ? o.email.trim().slice(0, 254) : "";
  const phone = typeof o.phone === "string" ? o.phone.trim().slice(0, 40) : "";
  const salon_type = typeof o.salon_type === "string" ? o.salon_type.trim().slice(0, 64) : "";
  const has = o.has_website === "no" ? "no" : "yes";
  const website_url =
    has === "yes" && typeof o.website_url === "string" ? o.website_url.trim().slice(0, 2048) : "";
  const lang = o.lang === "en" ? "en" : "nl";
  const tracking_context =
    typeof o.tracking_context === "string" ? o.tracking_context.trim().slice(0, 500) : undefined;

  if (!first_name || !last_name) {
    return { ok: false, message: "First and last name are required" };
  }
  if (!emailOk(email)) {
    return { ok: false, message: "Valid email is required" };
  }
  if (!salon_type) {
    return { ok: false, message: "Salon type is required" };
  }

  return {
    ok: true,
    data: {
      omb_form_id,
      first_name,
      last_name,
      email,
      phone,
      salon_type,
      has_website: has,
      website_url,
      lang,
      ...(tracking_context ? { tracking_context } : {}),
    },
  };
}

/** Maps Next `FreeDemoLeadForm` select slugs to Demo Request Form choice `value`s in WordPress. */
function mapSalonTypeToCfbChoice(slug: string): string {
  const t = slug.trim();
  const fromUi: Record<string, string> = {
    hair: "hair_salon",
    beauty: "beauty_salon",
    barber: "barbershop",
    nails: "nail_studio",
    other: "other",
  };
  if (fromUi[t]) return fromUi[t];
  const alreadyWp = new Set(["hair_salon", "beauty_salon", "barbershop", "nail_studio", "other"]);
  if (alreadyWp.has(t)) return t;
  return t;
}

type CfbFormField = {
  id?: string;
  name?: string;
  type?: string;
};

/** Values keyed by CFB field `name` (must match the linked `cfb_form` field names). */
function buildCfbValuesByName(payload: FreeDemoLeadPayload): Record<string, string> {
  const values: Record<string, string> = {
    first_name: payload.first_name,
    last_name: payload.last_name,
    email: payload.email,
    phone: payload.phone,
    salon_type: mapSalonTypeToCfbChoice(payload.salon_type),
    do_you_have_any_current_website: payload.has_website,
  };
  if (payload.has_website === "yes") {
    values.current_website_url = payload.website_url;
  }
  return values;
}

async function fetchCfbPublicFormFields(formId: number): Promise<CfbFormField[] | null> {
  const base = getWordpressApiUrl();
  if (!base) return null;
  const url = `${base}/custom-form-builder/v1/public/forms/${formId}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as { fields?: unknown };
    if (!Array.isArray(body.fields)) return null;
    return body.fields as CfbFormField[];
  } catch {
    return null;
  }
}

/**
 * OMB Form Builder reads `cfb[field_X]` — field **`id`**, not `name`.
 * Resolves `name` → `id` from the published form JSON before POST.
 */
function mapPayloadToCfbByFieldId(
  fields: CfbFormField[],
  payload: FreeDemoLeadPayload
): { cfb: Record<string, string>; cfb_visible_fields: string[] } {
  const valuesByName = buildCfbValuesByName(payload);
  const nameToId = new Map<string, string>();
  for (const field of fields) {
    const fid = typeof field.id === "string" ? field.id.trim() : "";
    const fname = typeof field.name === "string" ? field.name.trim() : "";
    const ftype = typeof field.type === "string" ? field.type : "";
    if (!fid || !fname || ftype === "section" || ftype === "html" || ftype === "row_break") {
      continue;
    }
    nameToId.set(fname, fid);
  }

  const cfb: Record<string, string> = {};
  const cfb_visible_fields: string[] = [];
  for (const [fname, value] of Object.entries(valuesByName)) {
    const fid = nameToId.get(fname);
    if (!fid) continue;
    cfb[fid] = value;
    cfb_visible_fields.push(fid);
  }
  return { cfb, cfb_visible_fields };
}

/**
 * Bearer for OMB Form Builder headless submit. Env first (`getOmbFormBuilderHeadlessSubmitSecret`),
 * then WordPress **Integrations** options: `omb_form_builder_submit_secret`, then `revalidation_secret`.
 */
export async function resolveOmbFormBuilderBearerSecret(lang: Locale): Promise<string | undefined> {
  const fromEnv = getOmbFormBuilderHeadlessSubmitSecret();
  if (fromEnv) return fromEnv;
  const globals = await fetchGlobals(lang);
  const { ombFormBuilderSubmitSecret, revalidationSecret } = globals.integrations;
  const fromWp = ombFormBuilderSubmitSecret.trim() || revalidationSecret.trim();
  return fromWp || undefined;
}

export async function submitOmbFreeDemoLead(
  payload: FreeDemoLeadSubmitInput
): Promise<{ ok: boolean; status: number; message?: string; redirect_url?: string }> {
  const base = getWordpressApiUrl();
  if (!base) {
    return { ok: false, status: 500, message: "WORDPRESS_API_URL is not set" };
  }
  const lang = (payload.lang === "en" ? "en" : "nl") as Locale;
  const secret = await resolveOmbFormBuilderBearerSecret(lang);
  if (!secret) {
    return {
      ok: false,
      status: 503,
      message:
        "Headless form submit secret is not configured (env: OMB_FORM_BUILDER_SUBMIT_SECRET, CFB_HEADLESS_SUBMIT_SECRET, or REVALIDATION_SECRET; or WordPress Integrations: OMB form submit secret / revalidation secret).",
    };
  }

  const path = `/custom-form-builder/v1/public/forms/${payload.omb_form_id}/submit`;
  const url = `${base}${path}`;
  const formFields = await fetchCfbPublicFormFields(payload.omb_form_id);
  if (!formFields?.length) {
    return {
      ok: false,
      status: 502,
      message: `Could not load OMB form schema for id ${payload.omb_form_id}.`,
    };
  }
  const { cfb, cfb_visible_fields } = mapPayloadToCfbByFieldId(formFields, payload);
  const wpBody = {
    cfb,
    cfb_visible_fields,
    cfb_post_id: 0,
  };

  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: `Bearer ${secret}`,
  });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(wpBody),
      cache: "no-store",
    });
    const text = await res.text();
    let message: string | undefined;
    let redirect_url: string | undefined;
    let parsed = false;
    let bodyOk: boolean | undefined;
    try {
      const trimmed = text.trim();
      if (!trimmed) {
        parsed = true;
      } else {
        const j = JSON.parse(trimmed) as {
          message?: string;
          redirect_url?: string;
          ok?: boolean;
        };
        parsed = true;
        if (typeof j.message === "string" && j.message.trim()) message = j.message.trim();
        if (typeof j.redirect_url === "string" && j.redirect_url.trim()) redirect_url = j.redirect_url.trim();
        bodyOk = j.ok;
      }
    } catch {
      if (text.trim()) message = text.slice(0, 280);
    }
    const httpOk = res.ok && res.status >= 200 && res.status < 300;
    const logicalOk = httpOk && parsed && bodyOk !== false;
    if (!logicalOk) {
      logger.warn("omb form builder free demo submit", {
        omb_form_id: payload.omb_form_id,
        url,
        status: res.status,
        message,
        code: bodyOk === false ? "body_ok_false" : undefined,
      });
    }
    if (!message && !logicalOk) {
      message = res.statusText || `Request failed (${res.status})`;
    }
    if (!logicalOk && res.status === 404 && message && message.includes("Form not found")) {
      message = `${message.trim()} (cfb_form id ${payload.omb_form_id}: must be published; if wp-config defines CFB_HEADLESS_PUBLIC_FORM_IDS, include this id.)`;
    }
    return { ok: logicalOk, status: res.status, message, redirect_url };
  } catch (e) {
    logger.error("omb form builder free demo submit", e);
    return { ok: false, status: 500, message: "Request failed" };
  }
}
