import { getWordpressBaseUrl } from "@/lib/wordpress/config";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formId = Number(id);
  if (!formId) {
    return NextResponse.json({ status: "error", message: "Invalid id" }, { status: 400 });
  }
  const body = await req.formData();
  const base = getWordpressBaseUrl();
  if (!base) {
    return NextResponse.json({ status: "error", message: "WORDPRESS_BASE_URL not set" }, { status: 500 });
  }
  const url = `${base}/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`;
  try {
    const res = await fetch(url, { method: "POST", body, cache: "no-store" });
    const json = (await res.json()) as { status: string; message: string };
    return NextResponse.json(json, { status: res.status });
  } catch (e) {
    return NextResponse.json(
      { status: "error", message: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    );
  }
}
