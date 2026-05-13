/** Shared `?page=` + `?s=` parsing for blog and case study archive pages. */
export type ArchiveUrlQuery = {
  page: number;
  search: string;
};

export function archiveQueryFromSearchParams(
  sp: Record<string, string | string[] | undefined>
): ArchiveUrlQuery {
  const rawP = sp.page;
  const rawS = sp.s;
  const pStr = typeof rawP === "string" ? rawP : Array.isArray(rawP) ? rawP[0] : "1";
  const sStr = typeof rawS === "string" ? rawS : Array.isArray(rawS) ? rawS[0] : "";
  const page = Math.max(1, Math.min(500, parseInt(pStr, 10) || 1));
  const search = (sStr || "").trim().slice(0, 200);
  return { page, search };
}
