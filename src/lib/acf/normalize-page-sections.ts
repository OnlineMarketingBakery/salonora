import type { AnySectionT } from "@/types/sections";
import { assertNever } from "@/lib/utils/assert-never";
import {
  asBool,
  asHtml,
  asImage,
  asLink,
  asNonNegativeInt,
  asRelationshipPostIds,
  asString,
  mapCtaRepeater,
  newSectionId,
} from "./field-mappers";

type RawRow = Record<string, unknown> & { acf_fc_layout: string };

/** Known page flexible-layout names → normalized section types (must stay aligned with `mapKnownPageSectionLayout`). */
const PAGE_SECTION_ACF_LAYOUTS = {
  announcement_bar: true,
  benefits_grid: true,
  cards: true,
  combined_strengths: true,
  cost_comparison: true,
  cta: true,
  design_showcase_grid: true,
  faq: true,
  feature_highlight_grid: true,
  feature_highlight_split: true,
  founder_story_split: true,
  faq_contact_split: true,
  features_checklist: true,
  form_embed: true,
  founders_banner: true,
  who_we_are_for: true,
  media_text_checklist: true,
  guarantee_split: true,
  growth_plans_split: true,
  guarantees_promise_split: true,
  hero: true,
  how_it_works_steps: true,
  image_intro_split: true,
  latest_posts: true,
  origin_story_split: true,
  partner_intro_split: true,
  pricing_cta: true,
  pricing_dual_cards: true,
  pricing_packages: true,
  process_steps: true,
  rich_text: true,
  salon_value_proposition: true,
  scrolling_ticker: true,
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

function keyOf(i: number, row: RawRow): string {
  return asString(row._key) || `row-${i}`;
}

export function normalizePageSections(raw: unknown): AnySectionT[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((row, i) => mapLayout(i, row as RawRow)).filter(Boolean) as AnySectionT[];
}

function mapLayout(i: number, row: RawRow): AnySectionT | null {
  const id = newSectionId();
  const _key = keyOf(i, row);
  const base = { _key, id };
  const layout = row.acf_fc_layout;
  if (!isKnownPageSectionLayout(layout)) return null;
  return mapKnownPageSectionLayout(layout, row, base);
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
              priceLine: asHtml(p.price_line),
              includes: Array.isArray(p.includes)
                ? (p.includes as { icon?: unknown; text?: unknown }[]).map((x) => ({
                    icon: asImage(x.icon),
                    text: asString(x.text),
                  }))
                : [],
              solvesTitle: asHtml(p.solves_title),
              solvesItems: Array.isArray(p.solves_items)
                ? (p.solves_items as { icon?: unknown; text?: unknown }[]).map((x) => ({
                    icon: asImage(x.icon),
                    text: asString(x.text),
                  }))
                : [],
              note: asHtml(p.note),
              smallPrint: asString(p.small_print),
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
        footerCtaIcon: asImage(row.footer_cta_icon),
        cards: Array.isArray(row.feature_cards)
          ? (row.feature_cards as { accent?: unknown; icon?: unknown; title?: unknown; text?: unknown }[]).map((c) => {
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
    case "form_embed":
      return {
        ...base,
        type: "form_embed",
        title: asString(row.title),
        intro: asHtml(row.intro),
        formId: (row.form as { id?: number } | null)?.id || 0,
        formDefinition: null,
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
