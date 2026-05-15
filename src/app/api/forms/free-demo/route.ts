import { NextResponse } from "next/server";
import { submitOmbFreeDemoLead, validateFreeDemoLeadPayload } from "@/lib/wordpress/submit-omb-free-demo-lead";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = validateFreeDemoLeadPayload(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, message: parsed.message }, { status: 400 });
  }

  const result = await submitOmbFreeDemoLead(parsed.data);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: result.message || "Error" },
      { status: result.status >= 400 && result.status < 600 ? result.status : 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: result.message,
    ...(result.redirect_url ? { redirect_url: result.redirect_url } : {}),
  });
}
