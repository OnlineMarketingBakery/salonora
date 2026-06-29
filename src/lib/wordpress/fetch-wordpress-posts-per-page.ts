import { cache } from "react";
import { wpFetchOptional } from "@/lib/wordpress/client";
import { logger } from "@/lib/utils/logger";

type WpSettings = {
  posts_per_page?: number;
};

const WP_REST_MAX_PER_PAGE = 100;

/**
 * WordPress Reading settings: "Blog pages show at most" (`posts_per_page`).
 * Requires application password auth on `/wp/v2/settings`.
 */
export const fetchWordPressPostsPerPage = cache(async (): Promise<number | null> => {
  const settings = await wpFetchOptional<WpSettings>("/wp/v2/settings", {
    revalidate: 3600,
  });

  const raw = settings?.posts_per_page;
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw < 1) {
    logger.warn("fetchWordPressPostsPerPage: settings unavailable or invalid", { raw });
    return null;
  }

  return Math.min(WP_REST_MAX_PER_PAGE, Math.max(1, Math.round(raw)));
});
