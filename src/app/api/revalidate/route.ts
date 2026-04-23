import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getRevalidationSecret } from "@/lib/wordpress/config";

export async function POST(req: Request) {
  const sec = getRevalidationSecret();
  if (!sec) {
    return NextResponse.json({ ok: false, error: "Revalidation not configured" }, { status: 500 });
  }
  const b = (await req.json().catch(() => ({}))) as { secret?: string; path?: string; tag?: string };
  if (b.secret !== sec) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (b.tag) revalidateTag(b.tag);
  if (b.path) revalidatePath(b.path);
  return NextResponse.json({ ok: true, revalidated: b.path || b.tag });
}
