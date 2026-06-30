export type PaginationItem = number | "ellipsis";

/**
 * Build page numbers + ellipsis for archive pagination.
 * - totalPages <= 1: empty (no pagination)
 * - totalPages <= 5: all page numbers
 * - totalPages > 5: 1, last, current, current±1 with ellipsis for gaps > 1
 */
export function buildArchivePaginationRange(
  totalPages: number,
  currentPage: number,
): PaginationItem[] {
  if (totalPages <= 1) return [];
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>([
    1,
    totalPages,
    currentPage,
    currentPage - 1,
    currentPage + 1,
  ]);

  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const result: PaginationItem[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push("ellipsis");
    }
    result.push(sorted[i]);
  }
  return result;
}
