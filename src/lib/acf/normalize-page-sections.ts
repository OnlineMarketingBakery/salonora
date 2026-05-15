import type { AnySectionT, SplitCopyFramedSectionT } from "@/types/sections";
import { assertNever } from "@/lib/utils/assert-never";
import {
  asBool,
  asHtml,
  asImage,
  asLink,
  asNonNegativeInt,
  asRelationshipPostIds,
  asCf7FormPostId,
  asString,
  mapCtaRepeater,
  newSectionId,
} from "./field-mappers";

type RawRow = Record<string, unknown> & { acf_fc_layout: string };

/** Legacy ACF layouts merged into `split_copy_framed` at normalize time (WP rows keep original `acf_fc_layout`). */
function canonicalizeAcfPageLayout(layout: string): string {
  if (layout === "audience_promo_card" || layout === "is_this_for_you") {
    return "split_copy_framed";
  }
  return layout;
}

function normalizeSplitCopyFramedSection(
  row: RawRow,
  base: { _key: string; id: string }
): SplitCopyFramedSectionT {
  const acfLayout = asString(row.acf_fc_layout);

  if (acfLayout === "split_copy_framed") {
    const listDefaultIcon = asImage(row.list_default_icon);
    const lm = asString(row.layout_mode);
    const layout_mode = lm === "flush_flex" ? ("flush_flex" as const) : ("card_grid" as const);
    const ls = asString(row.list_style);
    const list_style = ls === "outlined_tile" ? ("outlined_tile" as const) : ("filled_disc" as const);
    const vp = asString(row.visual_position);
    const visual_position = vp === "left" ? ("left" as const) : ("right" as const);
    const rawShadow = row.show_card_shadow;
    const show_card_shadow =
      layout_mode === "flush_flex"
        ? false
        : rawShadow === undefined || rawShadow === null
          ? true
          : asBool(rawShadow);
    const show_list_dividers = asBool(row.show_list_dividers);
    const cta_trailing_icon_invert = asBool(row.cta_trailing_icon_invert);
    const list = Array.isArray(row.list)
      ? (row.list as { item?: unknown; icon?: unknown }[]).map((r) => ({
          text: asString(r.item),
          icon: asImage(r.icon) ?? listDefaultIcon,
        }))
      : [];
    return {
      ...base,
      type: "split_copy_framed",
      layout_mode,
      list_style,
      visual_position,
      show_card_shadow,
      show_list_dividers,
      cta_trailing_icon_invert,
      badge_text: asString(row.badge_text),
      title: asString(row.title),
      subtitle: asString(row.subtitle),
      description: asHtml(row.description),
      list_default_icon: listDefaultIcon,
      list,
      footer_note: asHtml(row.footer_note),
      button: asLink(row.button),
      button_trailing_icon: asImage(row.button_trailing_icon),
      image: asImage(row.image),
    };
  }

  if (acfLayout === "audience_promo_card") {
    const listDefaultIcon = asImage(row.list_default_icon);
    const vp = asString(row.visual_position);
    const visual_position = vp === "right" ? ("right" as const) : ("left" as const);
    const rawShadow = row.show_card_shadow;
    const show_card_shadow =
      rawShadow === undefined || rawShadow === null ? true : asBool(rawShadow);
    return {
      ...base,
      type: "split_copy_framed",
      layout_mode: "card_grid",
      list_style: "filled_disc",
      visual_position,
      show_card_shadow,
      show_list_dividers: false,
      cta_trailing_icon_invert: false,
      badge_text: asString(row.badge_text),
      title: asString(row.title),
      subtitle: "",
      description: asHtml(row.description),
      list_default_icon: listDefaultIcon,
      list: Array.isArray(row.features)
        ? (row.features as { item?: unknown; icon?: unknown }[]).map((r) => ({
            text: asString(r.item),
            icon: asImage(r.icon) ?? listDefaultIcon,
          }))
        : [],
      footer_note: "",
      button: asLink(row.button),
      button_trailing_icon: asImage(row.button_trailing_icon),
      image: asImage(row.image),
    };
  }

  if (acfLayout === "is_this_for_you") {
    const listDefaultIcon = asImage(row.list_default_icon);
    const vp = asString(row.visual_position);
    const visual_position = vp === "left" ? ("left" as const) : ("right" as const);
    return {
      ...base,
      type: "split_copy_framed",
      layout_mode: "flush_flex",
      list_style: "outlined_tile",
      visual_position,
      show_card_shadow: false,
      show_list_dividers: true,
      cta_trailing_icon_invert: true,
      badge_text: "",
      title: asString(row.title),
      subtitle: asString(row.subtitle),
      description: "",
      list_default_icon: listDefaultIcon,
      list: Array.isArray(row.checklist)
        ? (row.checklist as { item?: unknown; icon?: unknown }[]).map((r) => ({
            text: asString(r.item),
            icon: asImage(r.icon) ?? listDefaultIcon,
          }))
        : [],
      footer_note: asHtml(row.footer_note),
      button: asLink(row.button),
      button_trailing_icon: asImage(row.button_trailing_icon),
      image: asImage(row.image),
    };
  }

  return assertNever(acfLayout as never);
}

/** Known page flexible-layout names → normalized section types (must stay aligned with `mapKnownPageSectionLayout`). */
const PAGE_SECTION_ACF_LAYOUTS = {
  announcement_bar: true,
  benefits_grid: true,
  cards: true,
  combined_strengths: true,
  cost_comparison: true,
  cta: true,
  demo_preview_split: true,
  design_showcase_grid: true,
  faq: true,
  feature_highlight_grid: true,
  feature_highlight_split: true,
  founder_story_split: true,
  faq_contact_split: true,
  features_checklist: true,
  form_embed: true,
  free_demo_form: true,
  founders_banner: true,
  who_we_are_for: true,
  media_text_checklist: true,
  guarantee_split: true,
  growth_plans_split: true,
  guarantees_promise_split: true,
  hero: true,
  how_it_works_steps: true,
  image_intro_split: true,
  is_demo_for_you: true,
  latest_posts: true,
  blog_post_overview: true,
  case_study_overview: true,
  origin_story_split: true,
  our_promises: true,
  partner_intro_split: true,
  pricing_cta: true,
  pricing_dual_cards: true,
  pricing_packages: true,
  problem_solution: true,
  process_steps: true,
  rich_text: true,
  case_study_chapter: true,
  case_study_product_shot: true,
  case_study_client_review: true,
  case_study_conversion_cta: true,
  salon_value_proposition: true,
  scrolling_ticker: true,
  split_copy_framed: true,
  steps_with_media: true,
  story_split: true,
  talk_dual_cards: true,
  team_behind_salonora: true,
  why_we_do_this: true,
  testimonials: true,
  why_owners_choose: true,
  why_salonora_anders: true,
  why_salonora_different: true,
} as const satisfies Record<AnySectionT["type"], true>;

function isKnownPageSectionLayout(value: string): value is AnySectionT["type"] {
  return Object.prototype.hasOwnProperty.call(PAGE_SECTION_ACF_LAYOUTS, value);
}

/** ACF `featured_case_study` post_object → REST may return `{ id }` or `{ ID }`. */
function featuredCaseStudyIdFromAcf(row: Record<string, unknown>): number | null {
  const v = row.featured_case_study;
  if (v == null || v === false || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
  if (typeof v === "object" && v !== null) {
    const o = v as { id?: unknown; ID?: unknown };
    const id = Number(o.ID ?? o.id);
    return Number.isFinite(id) && id > 0 ? id : null;
  }
  return null;
}

function heroStatsFromAcf(row: Record<string, unknown>): { label: string; value: string }[] {
  const raw = row.hero_stats;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const r = item as Record<string, unknown>;
      return { label: asString(r.stat_label), value: asString(r.stat_value) };
    })
    .filter((x) => x.label.trim() !== "" || x.value.trim() !== "");
}

/** ACF `featured_post` post_object → REST may return `{ id }` or `{ ID }`. */
/** Legacy `demo_preview_split` repeater `items` → single `body` HTML when `body` is empty. */
function demoPreviewBodyFromAcf(row: Record<string, unknown>): string {
  const primary = asHtml(row.body);
  if (primary.trim()) return primary;
  if (!Array.isArray(row.items)) return "";
  const escLead = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const parts: string[] = [];
  for (const item of row.items as { lead?: unknown; body?: unknown }[]) {
    const lead = asString(item.lead).trim();
    const body = asHtml(item.body).trim();
    if (!lead && !body) continue;
    if (!lead) {
      parts.push(body);
      continue;
    }
    if (!body) {
      parts.push(`<p><strong>${escLead(lead)}</strong></p>`);
    } else {
      parts.push(`<p><strong>${escLead(lead)}</strong> ${body}</p>`);
    }
  }
  return parts.join("");
}

function featuredPostIdFromAcf(row: Record<string, unknown>): number | null {
  const v = row.featured_post;
  if (v == null || v === false || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
  if (typeof v === "object" && v !== null) {
    const o = v as { id?: unknown; ID?: unknown };
    const id = Number(o.ID ?? o.id);
    return Number.isFinite(id) && id > 0 ? id : null;
  }
  return null;
}

function keyOf(i: number, row: RawRow): string {
  return asString(row._key) || `row-${i}`;
}

/** Stable DOM id for case study chapter headings (TOC anchors). */
function caseStudyChapterAnchorFromAcfKey(_key: string): string {
  const safe = asString(_key)
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return safe ? `cs-${safe}` : "cs-section";
}

export function normalizePageSections(raw: unknown): AnySectionT[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((row, i) => mapLayout(i, row as RawRow)).filter(Boolean) as AnySectionT[];
}

function mapLayout(i: number, row: RawRow): AnySectionT | null {
  const id = newSectionId();
  const _key = keyOf(i, row);
  const base = { _key, id };
  const layout = canonicalizeAcfPageLayout(asString(row.acf_fc_layout));
  if (!isKnownPageSectionLayout(layout)) return null;
  return mapKnownPageSectionLayout(layout as AnySectionT["type"], row, base);
}

function mapKnownPageSectionLayout(
  layout: AnySectionT["type"],
  row: RawRow,
  base: { _key: string; id: string }
): AnySectionT {
  switch (layout) {
    case "hero": {
      let ctas = mapCtaRepeater(row.ctas as Parameters<typeof mapCtaRepeater>[0]);
      if (!ctas.length) {
        const legacy: { cta_url?: unknown }[] = [];
        const primary = asLink(row.primary_cta);
        const secondary = asLink(row.secondary_cta);
        if (primary) legacy.push({ cta_url: primary });
        if (secondary) legacy.push({ cta_url: secondary });
        ctas = mapCtaRepeater(legacy);
      }
      const rawVariant = asString(row.variant);
      const variant = rawVariant === "compact" ? "compact" : "default";
      const rawOfferSize = asString(row.offer_text_size);
      const offerTextSize =
        rawOfferSize === "medium" || rawOfferSize === "small"
          ? rawOfferSize
          : "large";
      return {
        ...base,
        type: "hero",
        eyebrow: asString(row.eyebrow),
        title: asString(row.title),
        text: asHtml(row.text),
        offerText: asHtml(row.offer_text),
        trustLine: asHtml(row.trust_caption),
        ctas,
        trustImage: asImage(row.trust_image),
        behindImage: asImage(row.behind_image),
        behindImageRightPadding: asNonNegativeInt(row.behind_image_right_padding),
        image: asImage(row.image),
        tagline: asString(row.tagline),
        floatingCard: asHtml(row.floating_card),
        variant,
        offerTextSize,
      };
    }
    case "combined_strengths":
      return {
        ...base,
        type: "combined_strengths",
        title: asString(row.title),
        left_rows: Array.isArray(row.left_rows)
          ? (row.left_rows as { image?: unknown; description?: unknown }[]).map((r) => ({
              image: asImage(r.image),
              text: asHtml(r.description),
            }))
          : [],
        content_cards: Array.isArray(row.content_cards)
          ? (
              row.content_cards as { title?: unknown; description?: unknown; accent?: unknown }[]
            ).map((c, idx) => {
              const rawAccent = asString(c.accent);
              const accent =
                rawAccent === "rose"
                  ? ("rose" as const)
                  : rawAccent === "brand"
                    ? ("brand" as const)
                    : idx % 2 === 1
                      ? ("rose" as const)
                      : ("brand" as const);
              return {
                title: asString(c.title),
                text: asHtml(c.description),
                accent,
              };
            })
          : [],
        footer_logo: asImage(row.footer_logo),
        footer_text: asString(row.footer_text),
      };
    case "cards":
      return {
        ...base,
        type: "cards",
        title: asString(row.title),
        columns: (asString(row.columns) as "2" | "3" | "4" | "6") || "3",
        items: Array.isArray(row.items)
          ? (row.items as Record<string, unknown>[]).map((c) => {
              const link = asLink(c.link);
              return {
                icon: asImage(c.icon),
                title: asString(c.title),
                text: asHtml(c.text),
                link,
                ctaText: asString(c.cta_text) || link?.title || "",
                ctaSubtext: asString(c.cta_subtext),
                highlight: asBool(c.highlight),
              };
            })
          : [],
      };
    case "cost_comparison":
      return {
        ...base,
        type: "cost_comparison",
        title: asString(row.title),
        text: asHtml(row.text),
        lossCardTitle: asString(row.loss_card_title),
        ctas: mapCtaRepeater(row.ctas as Parameters<typeof mapCtaRepeater>[0]),
        lossItems: Array.isArray(row.loss_items)
          ? (row.loss_items as { label?: string; value?: string }[]).map((h) => ({
              label: asString(h.label),
              value: asString(h.value),
            }))
          : [],
        priceLabel: asString(row.price_label),
        price: asString(row.price),
        priceSubtext: asString(row.price_subtext),
      };
    case "benefits_grid":
      return {
        ...base,
        type: "benefits_grid",
        eyebrow: asString(row.eyebrow),
        title: asString(row.title),
        intro: asHtml(row.intro),
        items: Array.isArray(row.items)
          ? (row.items as { icon?: unknown; title?: unknown; text?: unknown }[]).map((b) => ({
              icon: asImage(b.icon),
              title: asString(b.title),
              text: asHtml(b.text),
            }))
          : [],
        urgencyText: asHtml(row.urgency_text),
        bannerLeftImage: asImage(row.banner_left_image),
        bannerRightImage: asImage(row.banner_right_image),
        bannerText: asHtml(row.banner_text),
        ctas: mapCtaRepeater(row.ctas as Parameters<typeof mapCtaRepeater>[0]),
      };
    case "pricing_packages":
      return {
        ...base,
        type: "pricing_packages",
        eyebrow: asString(row.eyebrow),
        title: asString(row.title),
        intro: asHtml(row.intro),
        items: Array.isArray(row.items)
          ? (row.items as Record<string, unknown>[]).map((p) => ({
              badge: asString(p.badge),
              title: asString(p.title),
              intro: asHtml(p.intro),
              includes: Array.isArray(p.includes)
                ? (p.includes as { icon?: unknown; text?: unknown }[]).map((x) => ({
                    icon: asImage(x.icon),
                    text: asString(x.text),
                  }))
                : [],
              pricingTitle: asHtml(p.pricing_title) || asHtml(p.price_line),
              secondaryTitle: asHtml(p.secondary_title) || asHtml(p.note),
              pricingParagraph: asHtml(p.pricing_paragraph) || asHtml(p.small_print),
              featured: asBool(p.featured),
              ctas: mapCtaRepeater(p.ctas as Parameters<typeof mapCtaRepeater>[0]),
            }))
          : [],
        bottomNote: asHtml(row.bottom_note),
        ctas: mapCtaRepeater(row.ctas as Parameters<typeof mapCtaRepeater>[0]),
      };
    case "guarantee_split":
      return {
        ...base,
        type: "guarantee_split",
        image: asImage(row.image),
        title: asString(row.title),
        text: asHtml(row.text),
        points: Array.isArray(row.points)
          ? (row.points as { icon?: unknown; text?: unknown }[]).map((p) => ({
              icon: asImage(p.icon),
              text: asString(p.text),
            }))
          : [],
        ctas: mapCtaRepeater(row.ctas as Parameters<typeof mapCtaRepeater>[0]),
        mediaPosition: (asString(row.media_position) as "left" | "right") || "left",
      };
    case "growth_plans_split":
      return (() => {
        const listDefaultIcon = asImage(row.list_default_icon);
        const mediaRaw = asString(row.media_position);
        const media_position = mediaRaw === "right" ? ("right" as const) : ("left" as const);
        return {
          ...base,
          type: "growth_plans_split",
          title: asString(row.title),
          intro: asHtml(row.intro),
          upcoming_heading: asString(row.upcoming_heading),
          list_default_icon: listDefaultIcon,
          upcoming_items: Array.isArray(row.upcoming_items)
            ? (
                row.upcoming_items as {
                  icon?: unknown;
                  text?: unknown;
                }[]
              ).map((p) => ({
                icon: asImage(p.icon) ?? listDefaultIcon,
                text: asHtml(p.text),
              }))
            : [],
          body: asHtml(row.body),
          highlight_line: asHtml(row.highlight_line),
          ctas: mapCtaRepeater(row.ctas as Parameters<typeof mapCtaRepeater>[0]),
          cta_trailing_icon: asImage(row.cta_trailing_icon),
          decorative_panel: asImage(row.decorative_panel),
          main_visual: asImage(row.main_visual),
          floating_circles: Array.isArray(row.floating_circles)
            ? (row.floating_circles as { image?: unknown }[]).flatMap((r) => {
                const img = asImage(r.image);
                return img ? [img] : [];
              })
            : [],
          media_position,
        };
      })();
    case "founders_banner":
      return {
        ...base,
        type: "founders_banner",
        headline: asHtml(row.headline),
        badge_text: asString(row.badge_text),
        pill_link: asLink(row.pill_link),
        left_image: asImage(row.left_image),
        right_image: asImage(row.right_image),
      };
    case "who_we_are_for":
      return {
        ...base,
        type: "who_we_are_for",
        title: asHtml(row.title),
        items: Array.isArray(row.items)
          ? (
              row.items as {
                icon?: unknown;
                label?: unknown;
                icon_accent?: unknown;
              }[]
            ).map((item) => {
              const a = asString(item.icon_accent);
              const icon_accent = a === "rose" ? ("rose" as const) : ("brand" as const);
              return {
                icon: asImage(item.icon),
                label: asHtml(item.label),
                icon_accent,
              };
            })
          : [],
        ctas: mapCtaRepeater(row.ctas as Parameters<typeof mapCtaRepeater>[0]),
      };
    case "our_promises":
      return {
        ...base,
        type: "our_promises",
        title: asString(row.title),
        items: Array.isArray(row.items)
          ? (
              row.items as {
                icon?: unknown;
                title?: unknown;
                description?: unknown;
                icon_accent?: unknown;
              }[]
            ).map((item) => {
              const a = asString(item.icon_accent);
              const icon_accent = a === "rose" ? ("rose" as const) : ("brand" as const);
              return {
                icon: asImage(item.icon),
                title: asString(item.title),
                description: asHtml(item.description),
                icon_accent,
              };
            })
          : [],
      };
    case "split_copy_framed":
      return normalizeSplitCopyFramedSection(row, base);
    case "features_checklist": {
      const listDefaultIcon = asImage(row.list_default_icon);
      return {
        ...base,
        type: "features_checklist",
        title: asString(row.title),
        description: asHtml(row.description),
        list_default_icon: listDefaultIcon,
        checklist: Array.isArray(row.checklist)
          ? (row.checklist as { item?: unknown; icon?: unknown }[]).map((r) => ({
              text: asString(r.item),
              icon: asImage(r.icon) ?? listDefaultIcon,
            }))
          : [],
        image: asImage(row.image),
        button: asLink(row.button),
        button_trailing_icon: asImage(row.button_trailing_icon),
      };
    }
    case "media_text_checklist": {
      const mp = asString(row.media_position);
      const media_position = mp === "left" ? ("left" as const) : ("right" as const);
      const ps = asString(row.panel_style);
      const panel_style = ps === "white_card" ? ("white_card" as const) : ("soft_surface" as const);
      const listDefaultIcon = asImage(row.list_default_icon);
      return {
        ...base,
        type: "media_text_checklist",
        media_position,
        panel_style,
        image_top: asImage(row.image_top),
        image_bottom: asImage(row.image_bottom),
        title: asString(row.title),
        subtitle: asString(row.subtitle),
        description: asHtml(row.description),
        checklist_title: asString(row.checklist_title),
        list_default_icon: listDefaultIcon,
        checklist: Array.isArray(row.checklist)
          ? (row.checklist as { item?: unknown; icon?: unknown }[]).map((r) => ({
              text: asString(r.item),
              icon: asImage(r.icon) ?? listDefaultIcon,
            }))
          : [],
        testimonial_heading: asString(row.testimonial_heading),
        testimonial_body: asHtml(row.testimonial_body),
        testimonial_author_image: asImage(row.testimonial_author_image),
        testimonial_author_name: asString(row.testimonial_author_name),
        testimonial_author_role: asString(row.testimonial_author_role),
        pricing_label: asString(row.pricing_label),
        button: asLink(row.button),
        button_trailing_icon: asImage(row.button_trailing_icon),
      };
    }
    case "guarantees_promise_split":
      return (() => {
        const listDefaultIcon = asImage(row.list_default_icon);
        return {
          ...base,
          type: "guarantees_promise_split",
          badge: asString(row.badge),
          title: asString(row.title),
          image: asImage(row.image),
          list_default_icon: listDefaultIcon,
          points: Array.isArray(row.points)
            ? (
                row.points as {
                  text?: unknown;
                  icon?: unknown;
                }[]
              ).map((p) => ({
                text: asHtml(p.text),
                icon: asImage(p.icon) ?? listDefaultIcon,
              }))
            : [],
          floatingBadges: Array.isArray(row.floating_badges)
          ? (
              row.floating_badges as {
                icon?: unknown;
                text?: unknown;
                accent?: unknown;
                position?: unknown;
              }[]
            ).map((b) => {
              const a = asString(b.accent);
              const accent = a === "rose" ? ("rose" as const) : ("brand" as const);
              const pos = asString(b.position);
              const position = pos === "right" ? ("right" as const) : ("left" as const);
              return {
                icon: asImage(b.icon),
                text: asString(b.text),
                accent,
                position,
              };
            })
          : [],
          downloadLink: asLink(row.download_link),
          cta_trailing_icon: asImage(row.cta_trailing_icon),
        };
      })();
    case "story_split":
      return {
        ...base,
        type: "story_split",
        image: asImage(row.image),
        title: asString(row.title),
        body: asHtml(row.body),
        ctas: mapCtaRepeater(row.ctas as Parameters<typeof mapCtaRepeater>[0]),
        showAccentShape: row.show_accent_shape === undefined ? true : asBool(row.show_accent_shape),
      };
    case "why_we_do_this":
      return {
        ...base,
        type: "why_we_do_this",
        image: asImage(row.image),
        backgroundGraphic: asImage(row.background_graphic),
        behindGraphic: asImage(row.behind_graphic),
        eyebrow: asString(row.eyebrow),
        title: asString(row.title),
        body: asHtml(row.body),
        highlightLine: asHtml(row.highlight_line),
      };
    case "partner_intro_split":
      return {
        ...base,
        type: "partner_intro_split",
        title: asString(row.title),
        body: asHtml(row.body),
        highlightLine: asHtml(row.highlight_line),
        image: asImage(row.image),
        ctas: mapCtaRepeater(row.ctas as Parameters<typeof mapCtaRepeater>[0]),
      };
    case "origin_story_split":
      return {
        ...base,
        type: "origin_story_split",
        eyebrow: asString(row.eyebrow),
        title: asString(row.title),
        body: asHtml(row.body),
        image: asImage(row.image),
        ctas: mapCtaRepeater(row.ctas as Parameters<typeof mapCtaRepeater>[0]),
      };
    case "founder_story_split":
      return {
        ...base,
        type: "founder_story_split",
        avatar: asImage(row.avatar),
        title: asString(row.title),
        subtitle: asString(row.subtitle),
        content: asHtml(row.content),
        conclusion: asString(row.conclusion),
        main_image: asImage(row.main_image),
      };
    case "image_intro_split":
      return {
        ...base,
        type: "image_intro_split",
        image: asImage(row.image),
        eyebrow: asString(row.eyebrow),
        title: asString(row.title),
        intro: asHtml(row.intro),
        imageTextRows: Array.isArray(row.image_text_rows)
          ? (row.image_text_rows as { icon?: unknown; text?: unknown }[]).map((r) => ({
              icon: asImage(r.icon),
              text: asString(r.text),
            }))
          : [],
      };
    case "is_demo_for_you":
      return {
        ...base,
        type: "is_demo_for_you",
        title: asString(row.title),
        for_you_heading: asString(row.for_you_heading),
        for_you_list_icon: asImage(row.for_you_list_icon),
        for_you_list: Array.isArray(row.for_you_list)
          ? (row.for_you_list as { item?: unknown }[])
              .map((r) => ({ text: asString(r.item) }))
              .filter((r) => r.text.trim() !== "")
          : [],
        not_for_you_heading: asString(row.not_for_you_heading),
        not_for_you_list_icon: asImage(row.not_for_you_list_icon),
        not_for_you_list: Array.isArray(row.not_for_you_list)
          ? (row.not_for_you_list as { item?: unknown }[])
              .map((r) => ({ text: asString(r.item) }))
              .filter((r) => r.text.trim() !== "")
          : [],
        portrait_image: asImage(row.portrait_image),
        panel_overlay: asImage(row.panel_overlay),
        footer_message: asHtml(row.footer_message),
        cta_link: asLink(row.cta_link),
        cta_trailing_icon: asImage(row.cta_trailing_icon),
      };
    case "salon_value_proposition":
      return {
        ...base,
        type: "salon_value_proposition",
        eyebrow: asString(row.eyebrow),
        title: asString(row.title),
        intro: asHtml(row.intro),
        visualImage: asImage(row.visual_image),
        footerTitle: asString(row.footer_title),
        footerCtaLink: asLink(row.footer_cta_link),
        footerCtaIcon:
          asImage(row.footer_cta_icon) ??
          asImage((row as Record<string, unknown>).footer_button_icon),
        cards: Array.isArray(row.feature_cards)
          ? (row.feature_cards as {
              accent?: unknown;
              icon?: unknown;
              checklist_icon?: unknown;
              title?: unknown;
              checklist_items?: unknown;
            }[]).map((c) => {
              const a = asString(c.accent);
              const accent = a === "rose" ? "rose" : "brand";
              const checklistItems = Array.isArray(c.checklist_items)
                ? (c.checklist_items as { item?: unknown }[])
                    .map((r) => ({ text: asString(r.item) }))
                    .filter((r) => r.text.trim() !== "")
                : [];
              return {
                accent,
                icon: asImage(c.icon),
                checklistIcon: asImage(c.checklist_icon),
                title: asString(c.title),
                checklistItems,
              };
            })
          : [],
      };
    case "why_owners_choose":
      return {
        ...base,
        type: "why_owners_choose",
        eyebrow: asString(row.eyebrow),
        title: asString(row.title),
        cards: Array.isArray(row.why_cards)
          ? (row.why_cards as { accent?: unknown; icon?: unknown; title?: unknown; text?: unknown }[]).map((c) => {
              const a = asString(c.accent);
              const accent = a === "rose" ? "rose" : "brand";
              return {
                accent,
                icon: asImage(c.icon),
                title: asString(c.title),
                text: asHtml(c.text),
              };
            })
          : [],
        panelTitle: asString(row.panel_title),
        panelText: asHtml(row.panel_text),
        panelImage: asImage(row.panel_image),
        ctas: mapCtaRepeater(row.ctas as Parameters<typeof mapCtaRepeater>[0]),
      };
    case "why_salonora_different":
      return {
        ...base,
        type: "why_salonora_different",
        title: asString(row.title),
        paragraph1: asHtml(row.paragraph_1),
        paragraph2: asHtml(row.paragraph_2),
        ctas: mapCtaRepeater(row.ctas as Parameters<typeof mapCtaRepeater>[0]),
        insightHeading: asString(row.insight_heading),
        insightCards: Array.isArray(row.insight_cards)
          ? (row.insight_cards as { text?: unknown }[]).map((c) => ({
              text: asHtml(c.text),
            }))
          : [],
        phoneImage: asImage(row.phone_image),
      };
    case "why_salonora_anders":
      return {
        ...base,
        type: "why_salonora_anders",
        title: asString(row.title),
        paragraph1: asHtml(row.paragraph_1),
        paragraph2: asHtml(row.paragraph_2),
        ctas: mapCtaRepeater(row.ctas as Parameters<typeof mapCtaRepeater>[0]),
        insightHeading: asString(row.insight_heading),
        insightCards: Array.isArray(row.insight_cards)
          ? (row.insight_cards as { text?: unknown }[]).map((c) => ({
              text: asHtml(c.text),
            }))
          : [],
        phoneImage: asImage(row.phone_image),
      };
    case "testimonials": {
      const testimonialIds = asRelationshipPostIds(row.items);
      let ctas = mapCtaRepeater(row.ctas as Parameters<typeof mapCtaRepeater>[0]);
      if (!ctas.length) {
        const single = asLink(row.cta);
        if (single) ctas = [{ text: single.title || "Meer informatie", url: single }];
      }
      const pv = asString(row.items_per_view);
      const items_per_view: 1 | 2 | 3 = pv === "1" ? 1 : pv === "3" ? 3 : 2;
      return {
        ...base,
        type: "testimonials",
        title: asString(row.title),
        intro: asHtml(row.intro),
        ctas,
        items: [],
        testimonialIds,
        items_per_view,
      };
    }
    case "announcement_bar":
      return {
        ...base,
        type: "announcement_bar",
        items: Array.isArray(row.items) ? (row.items as { text?: unknown }[]).map((x) => ({ text: asHtml(x.text) })) : [],
      };
    case "process_steps":
      return {
        ...base,
        type: "process_steps",
        title: asString(row.title),
        intro: asHtml(row.intro),
        smallText: asString(row.small_text),
        items: Array.isArray(row.items)
          ? (row.items as { number?: unknown; title?: unknown; text?: unknown; highlight?: unknown }[]).map(
              (s) => ({
                number: asString(s.number),
                title: asString(s.title),
                text: asHtml(s.text),
                highlight: asBool(s.highlight),
              })
            )
          : [],
        ctas: mapCtaRepeater(row.ctas as Parameters<typeof mapCtaRepeater>[0]),
      };
    case "how_it_works_steps":
      return {
        ...base,
        type: "how_it_works_steps",
        badge: asString(row.badge),
        title: asString(row.title),
        steps: Array.isArray(row.steps)
          ? (
              row.steps as {
                icon?: unknown;
                icon_background_color?: unknown;
                title?: unknown;
                description?: unknown;
              }[]
            ).map((s) => {
              const a = asString(s.icon_background_color);
              const iconAccent = a === "rose" ? "rose" : "brand";
              return {
                icon: asImage(s.icon),
                iconAccent,
                title: asString(s.title),
                description: asHtml(s.description),
              };
            })
          : [],
        ctas: mapCtaRepeater(row.ctas as Parameters<typeof mapCtaRepeater>[0]),
        footerTagline: asString(row.footer_tagline),
      };
    case "scrolling_ticker":
      return {
        ...base,
        type: "scrolling_ticker",
        items: Array.isArray(row.items)
          ? (row.items as { text?: unknown }[]).map((x) => ({
              text: asHtml(x.text),
            }))
          : [],
      };
    case "steps_with_media":
      return {
        ...base,
        type: "steps_with_media",
        title: asString(row.title),
        steps: Array.isArray(row.steps)
          ? (row.steps as { number?: unknown; icon_color?: unknown; title?: unknown; description?: unknown }[]).map(
              (s) => {
                const rawColor = asString(s.icon_color);
                const icon_color = rawColor === "pink" ? ("pink" as const) : ("blue" as const);
                return {
                  number: asString(s.number),
                  icon_color,
                  title: asString(s.title),
                  description: asHtml(s.description),
                };
              },
            )
          : [],
        cta_link: asLink(row.cta_link),
        browser_image: asImage(row.browser_image),
      };
    case "feature_highlight_grid":
      return {
        ...base,
        type: "feature_highlight_grid",
        badge: asString(row.badge),
        title: asString(row.title),
        cards: Array.isArray(row.cards)
          ? (row.cards as { title?: unknown; visual?: unknown; description?: unknown }[]).map((c) => ({
              title: asString(c.title),
              visual: asImage(c.visual),
              description: asHtml(c.description),
            }))
          : [],
      };
    case "feature_highlight_split":
      return {
        ...base,
        type: "feature_highlight_split",
        badge: asString(row.badge),
        title: asString(row.title),
        ctas: mapCtaRepeater(row.ctas as Parameters<typeof mapCtaRepeater>[0]),
        mockup_image: asImage(row.mockup_image),
        promise_items: Array.isArray(row.promise_items)
          ? (row.promise_items as { text?: unknown }[]).map((p) => ({
              text: asHtml(p.text),
            }))
          : [],
      };
    case "team_behind_salonora":
      return {
        ...base,
        type: "team_behind_salonora",
        title: asString(row.title),
        members: Array.isArray(row.members)
          ? (
              row.members as {
                name?: unknown;
                bio?: unknown;
                photo?: unknown;
                accent?: unknown;
                facebook?: unknown;
                instagram?: unknown;
                linkedin?: unknown;
              }[]
            ).map((m) => {
              const a = asString(m.accent);
              const accent = a === "rose" ? "rose" : "brand";
              return {
                name: asString(m.name),
                bio: asHtml(m.bio),
                photo: asImage(m.photo),
                accent,
                facebook: asLink(m.facebook),
                instagram: asLink(m.instagram),
                linkedin: asLink(m.linkedin),
              };
            })
          : [],
        bottomText: asHtml(row.bottom_text),
        backgroundWordmark: asImage(row.background_wordmark),
        backgroundOverlay: asImage(row.background_overlay),
        cornerTopRight: asImage(row.corner_top_right),
        cornerBottomLeft: asImage(row.corner_bottom_left),
        cornerLinesTopLeft: asImage(row.corner_lines_top_left),
        cornerLinesBottomRight: asImage(row.corner_lines_bottom_right),
      };
    case "faq_contact_split": {
      const ctaform = asString(row.ctaform);
      const useForm = ctaform === "form" || ctaform.toLowerCase().includes("form");
      const bgRaw = asString(row.section_background);
      const sectionBackground = bgRaw === "navy" ? "navy" : "white";
      return {
        ...base,
        type: "faq_contact_split",
        sectionBackground,
        title: asString(row.title),
        intro: asHtml(row.intro),
        items: Array.isArray(row.items)
          ? (row.items as { question?: unknown; answer?: unknown }[]).map((q) => ({
              question: asString(q.question),
              answer: asString(q.answer),
            }))
          : [],
        pricingCtas: Array.isArray(row.pricing_ctas)
          ? (
              row.pricing_ctas as {
                cta_text?: unknown;
                cta_link?: unknown;
                trailing_icon?: unknown;
              }[]
            ).map((c) => ({
              text: asString(c.cta_text),
              link: asLink(c.cta_link),
              trailing_icon: asImage(c.trailing_icon),
            }))
          : [],
        cardTitle: asString(row.card_title),
        cardText: asHtml(row.card_text),
        contactCtas: Array.isArray(row.contact_ctas)
          ? (row.contact_ctas as { icon?: unknown; cta_icon?: unknown; cta_text?: unknown; cta_link?: unknown }[]).map(
              (c) => ({
                icon: asImage(c.icon ?? c.cta_icon),
                ctaText: asString(c.cta_text),
                ctaLink: asLink(c.cta_link),
              })
            )
          : [],
        ctaform,
        useForm,
        customForm: row.custom_form
          ? { id: (row.custom_form as { id?: number })?.id || 0 }
          : null,
        formDefinition: null,
        defaultFormId: null,
      };
    }
    case "design_showcase_grid":
      return (() => {
        const colsRaw = asString(row.grid_columns);
        const gridColumns =
          colsRaw === "1" || colsRaw === "2" || colsRaw === "3" ? (Number(colsRaw) as 1 | 2 | 3) : 2;
        const parsedRows = parseInt(asString(row.grid_rows), 10);
        let gridRows =
          Number.isFinite(parsedRows) && parsedRows >= 1 ? parsedRows : 0;
        if (!gridRows) {
          const legacyTotal = Number(row.items_count);
          if (Number.isFinite(legacyTotal) && legacyTotal > 0) {
            gridRows = Math.max(1, Math.ceil(legacyTotal / gridColumns));
          } else {
            gridRows = 2;
          }
        }
        const count = gridRows * gridColumns;
        return {
          ...base,
          type: "design_showcase_grid",
          title: asString(row.title),
          intro: asHtml(row.intro),
          gridRows,
          gridColumns,
          count,
          whiteBackground: asBool(row.white_background),
          cardPanelTint: (() => {
            const s = asString(row.card_panel_tint);
            if (s === "blush" || s === "mint" || s === "gold" || s === "surface") return s;
            return "surface";
          })(),
          cards: [],
          footerCtas: mapCtaRepeater(row.footer_ctas as Parameters<typeof mapCtaRepeater>[0]),
        };
      })();
    case "demo_preview_split":
      return {
        ...base,
        type: "demo_preview_split",
        badge: asString(row.badge),
        title: asString(row.title),
        body: demoPreviewBodyFromAcf(row),
        mockup_image: asImage(row.mockup_image),
      };
    case "form_embed":
      return {
        ...base,
        type: "form_embed",
        title: asString(row.title),
        intro: asHtml(row.intro),
        formId: asCf7FormPostId(row.form),
        formDefinition: null,
        successMode: (asString(row.success_mode) as "inline" | "redirect") || "inline",
        redirectLink: asLink(row.redirect_link),
        trackingContext: asString(row.tracking_context),
      };
    case "free_demo_form":
      return {
        ...base,
        type: "free_demo_form",
        title: asString(row.title),
        subtitle: asHtml(row.subtitle),
        footer_note: asHtml(row.footer_note),
        ombFormId: asCf7FormPostId(row.omb_form),
        successMode: (asString(row.success_mode) as "inline" | "redirect") || "inline",
        redirectLink: asLink(row.redirect_link),
        trackingContext: asString(row.tracking_context),
      };
    case "latest_posts":
      return {
        ...base,
        type: "latest_posts",
        title: asString(row.title),
        source: (asString(row.source) as "post" | "service") || "post",
        count: Number(row.items_count) || 3,
        showExcerpt: asBool(row.show_excerpt),
        items: [],
      };
    case "blog_post_overview":
      return {
        ...base,
        type: "blog_post_overview",
        title: asString(row.title),
        intro: asString(row.intro),
        showSearch: row.show_search === undefined || row.show_search === null ? true : asBool(row.show_search),
        showFeatured: row.show_featured === undefined || row.show_featured === null ? true : asBool(row.show_featured),
        featuredPostId: featuredPostIdFromAcf(row),
        postsPerPage: Math.min(50, Math.max(1, Number(row.posts_per_page) || 6)),
        readMoreLabel: asString(row.read_more_label),
        archivePath: "",
        items: [],
        total: 0,
        totalPages: 1,
        currentPage: 1,
        searchQuery: "",
      };
    case "case_study_overview": {
      const colsRaw = asString(row.grid_columns);
      const gridColumns =
        colsRaw === "1" || colsRaw === "2" || colsRaw === "3" || colsRaw === "4"
          ? (Number(colsRaw) as 1 | 2 | 3 | 4)
          : 3;
      const parsedRows = parseInt(asString(row.grid_rows), 10);
      const gridRows =
        Number.isFinite(parsedRows) && parsedRows >= 1 ? Math.min(12, parsedRows) : 2;
      /** List grid is fixed at 3 columns on large screens; rows field drives pagination only. */
      const postsPerPage = Math.min(50, Math.max(1, 3 * gridRows));
      return {
        ...base,
        type: "case_study_overview",
        title: asString(row.title),
        intro: asString(row.intro),
        heroStats: heroStatsFromAcf(row),
        showFeatured: row.show_featured === undefined || row.show_featured === null ? true : asBool(row.show_featured),
        featuredCaseStudyId: featuredCaseStudyIdFromAcf(row),
        gridColumns,
        gridRows,
        postsPerPage,
        readMoreLabel: asString(row.read_more_label),
        archivePath: "",
        items: [],
        total: 0,
        totalPages: 1,
        currentPage: 1,
        searchQuery: "",
      };
    }
    case "cta": {
      let ctas = mapCtaRepeater(row.ctas as Parameters<typeof mapCtaRepeater>[0]);
      const single = asLink(row.link);
      if (!ctas.length && single) {
        ctas = [{ text: single.title || "Meer informatie", url: single }];
      }
      return {
        ...base,
        type: "cta",
        title: asString(row.title),
        text: asHtml(row.text) || asString(row.text),
        ctas,
        alignment: (asString(row.alignment) as "left" | "center") || "center",
        theme: (asString(row.theme) as "light" | "dark" | "brand") || undefined,
        backgroundImage: asImage(row.background_image),
        singleLink: single,
      };
    }
    case "pricing_cta":
      return {
        ...base,
        type: "pricing_cta",
        title: asString(row.title),
        intro: asHtml(row.intro),
        cardsTitle: asHtml(row.cards_title),
        pricingCards: Array.isArray(row.pricing_cards)
          ? (row.pricing_cards as { title?: unknown; description?: unknown; ctas?: unknown; ctas_copy?: unknown }[]).map(
              (c) => ({
                title: asString(c.title),
                description: asHtml(c.description),
                ctas: mapCtaRepeater(
                  (c.ctas ?? c.ctas_copy) as Parameters<typeof mapCtaRepeater>[0]
                ),
              })
            )
          : [],
        bottomContactText: asHtml(row.bottom_contact_text),
      };
    case "pricing_dual_cards":
      return {
        ...base,
        type: "pricing_dual_cards",
        badge: asString(row.badge),
        title: asString(row.title),
        intro: asHtml(row.intro),
        hero_person_image: asImage(row.hero_person_image),
        cards: Array.isArray(row.cards)
          ? (row.cards as Record<string, unknown>[]).map((c) => {
              const ps = asString(c.panel_style);
              const panel_style = ps === "tinted" ? "tinted" : "white";
              return {
                panel_style,
                title: asString(c.title),
                description: asHtml(c.description),
                features: Array.isArray(c.features)
                  ? (c.features as { icon?: unknown; text?: unknown }[]).map((f) => ({
                      icon: asImage(f.icon),
                      text: asString(f.text),
                    }))
                  : [],
                price_highlight: asHtml(c.price_highlight),
                price_secondary: asHtml(c.price_secondary),
                price_footer: asHtml(c.price_footer),
                ctas: mapCtaRepeater(c.ctas as Parameters<typeof mapCtaRepeater>[0]),
              };
            })
          : [],
      };
    case "problem_solution":
      return {
        ...base,
        type: "problem_solution",
        problem_title: asString(row.problem_title),
        problem_text: asHtml(row.problem_text),
        problem_image: asImage(row.problem_image),
        solution_title: asString(row.solution_title),
        solution_text: asHtml(row.solution_text),
        solution_list_icon: asImage(row.solution_list_icon),
        solution_list: Array.isArray(row.solution_list)
          ? (row.solution_list as { item?: unknown }[])
              .map((r) => ({ text: asString(r.item) }))
              .filter((r) => r.text.trim() !== "")
          : [],
        solution_bottom_text: asHtml(row.solution_bottom_text),
        solution_image: asImage(row.solution_image),
      };
    case "talk_dual_cards":
      return {
        ...base,
        type: "talk_dual_cards",
        title: asString(row.title),
        left_body: asHtml(row.left_body),
        left_link: asLink(row.left_link),
        left_button_icon: asImage(row.left_button_icon),
        left_corner_graphic: asImage(row.left_corner_graphic),
        right_body: asHtml(row.right_body),
        right_primary_link: asLink(row.right_primary_link),
        right_secondary_link: asLink(row.right_secondary_link),
        right_primary_button_icon: asImage(row.right_primary_button_icon),
        right_secondary_button_icon: asImage(row.right_secondary_button_icon),
        right_overlay_graphic: asImage(row.right_overlay_graphic),
      };
    case "rich_text":
      return {
        ...base,
        type: "rich_text",
        title: asString(row.title),
        body: asHtml(row.body),
        contentWidth: (asString(row.content_width) as "default" | "narrow" | "wide") || "default",
      };
    case "case_study_chapter":
      return {
        ...base,
        type: "case_study_chapter",
        heading: asString(row.heading),
        body: asHtml(row.body),
        showDivider:
          row.show_divider_after === undefined || row.show_divider_after === null ? true : asBool(row.show_divider_after),
        tocAnchorId: caseStudyChapterAnchorFromAcfKey(base._key),
      };
    case "case_study_product_shot":
      return {
        ...base,
        type: "case_study_product_shot",
        image: asImage(row.image),
        title: asString(row.title || row.caption),
        description: asHtml(row.description),
        showDivider:
          row.show_divider_after === undefined || row.show_divider_after === null ? true : asBool(row.show_divider_after),
      };
    case "case_study_client_review":
      return {
        ...base,
        type: "case_study_client_review",
        sectionHeading: asString(row.section_heading),
        quote: asHtml(row.quote),
        videoUrl: asString(row.video_url).trim(),
        videoPoster: asImage(row.video_poster),
        personName: asString(row.person_name),
        personRole: asString(row.person_role),
        personPhoto: asImage(row.person_photo),
        tocAnchorId: caseStudyChapterAnchorFromAcfKey(base._key),
      };
    case "case_study_conversion_cta":
      return {
        ...base,
        type: "case_study_conversion_cta",
        title: asString(row.title),
        subtitle: asHtml(row.subtitle),
        cta: asLink(row.cta),
      };
    case "faq":
      return {
        ...base,
        type: "faq",
        title: asString(row.title),
        items: Array.isArray(row.items)
          ? (row.items as { question?: unknown; answer?: unknown }[]).map((q) => ({
              question: asString(q.question),
              answer: asString(q.answer),
            }))
          : [],
      };
    default:
      assertNever(layout);
  }
}
