import { logger } from "@/lib/utils/logger";
import { getOmbFormBuilderHeadlessSubmitSecret, getWordpressApiUrl } from "./config";

/** Field keys in `cfb` must match the **field id** strings configured in OMB Form Builder for this form. */
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
  const company = typeof o.company === "string" ? o.company.trim() : "";
  if (company) {
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

function buildCfbBody(payload: FreeDemoLeadPayload): {
  cfb: Record<string, string>;
  cfb_visible_fields: string[];
} {
  const cfb: Record<string, string> = {
    first_name: payload.first_name,
    last_name: payload.last_name,
    email: payload.email,
    phone: payload.phone,
    salon_type: payload.salon_type,
    has_website: payload.has_website,
    lang: payload.lang,
  };
  if (payload.has_website === "yes") {
    cfb.website_url = payload.website_url;
  }
  if (payload.tracking_context) {
    cfb.tracking_context = payload.tracking_context;
  }
  return { cfb, cfb_visible_fields: Object.keys(cfb) };
}

export async function submitOmbFreeDemoLead(
  payload: FreeDemoLeadSubmitInput
): Promise<{ ok: boolean; status: number; message?: string; redirect_url?: string }> {
  const base = getWordpressApiUrl();
  if (!base) {
    return { ok: false, status: 500, message: "WORDPRESS_API_URL is not set" };
  }
  const secret = getOmbFormBuilderHeadlessSubmitSecret();
  if (!secret) {
    return { ok: false, status: 503, message: "OMB_FORM_BUILDER_SUBMIT_SECRET is not set" };
  }

  const path = `/custom-form-builder/v1/public/forms/${payload.omb_form_id}/submit`;
  const url = `${base}${path}`;
  const { cfb, cfb_visible_fields } = buildCfbBody(payload);
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
        status: res.status,
        message,
        code: bodyOk === false ? "body_ok_false" : undefined,
      });
    }
    if (!message && !logicalOk) {
      message = res.statusText || `Request failed (${res.status})`;
    }
    return { ok: logicalOk, status: res.status, message, redirect_url };
  } catch (e) {
    logger.error("omb form builder free demo submit", e);
    return { ok: false, status: 500, message: "Request failed" };
  }
}
