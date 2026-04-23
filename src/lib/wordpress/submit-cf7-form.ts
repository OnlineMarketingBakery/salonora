import { getWordpressBaseUrl } from "./config";
import { logger } from "@/lib/utils/logger";

/**
 * Submits a Contact Form 7 form via the official feedback REST endpoint.
 * Field keys must match the form's `name` attributes in WordPress.
 */
export async function submitCf7Form(
  formId: number,
  data: FormData
): Promise<{ status: "success" | "error"; message?: string }> {
  const base = getWordpressBaseUrl();
  const url = `${base}/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`;
  try {
    const res = await fetch(url, { method: "POST", body: data });
    const json = (await res.json()) as { status: string; message: string; invalid_fields?: string[] };
    if (json.status === "mail_sent" || res.ok) {
      return { status: "success", message: json.message };
    }
    logger.warn("cf7 submit", json);
    return { status: "error", message: json.message || "Error" };
  } catch (e) {
    logger.error("cf7", e);
    return { status: "error", message: "Request failed" };
  }
}
