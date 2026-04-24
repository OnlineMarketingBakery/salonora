import type { AnySectionT } from "@/types/sections";
import {
  asBool,
  asHtml,
  asImage,
  asLink,
  asString,
  mapCtaRepeater,
  newSectionId,
} from "./field-mappers";

type RawRow = Record<string, unknown> & { acf_fc_layout: string };

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
  switch (row.acf_fc_layout) {
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
        image: asImage(row.image),
      };
    }
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
    case "testimonials": {
      const rel = row.items;
      const testimonialIds = Array.isArray(rel)
        ? (rel as { id?: number }[]).map((o) => o.id).filter((x): x is number => typeof x === "number")
        : [];
      return {
        ...base,
        type: "testimonials",
        title: asString(row.title),
        intro: asHtml(row.intro),
        cta: asLink(row.cta),
        items: [],
        testimonialIds,
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
    case "faq_contact_split": {
      const ctaform = asString(row.ctaform);
      const useForm = ctaform === "form" || ctaform.toLowerCase().includes("form");
      return {
        ...base,
        type: "faq_contact_split",
        title: asString(row.title),
        intro: asHtml(row.intro),
        items: Array.isArray(row.items)
          ? (row.items as { question?: unknown; answer?: unknown }[]).map((q) => ({
              question: asString(q.question),
              answer: asString(q.answer),
            }))
          : [],
        pricingCtas: Array.isArray(row.pricing_ctas)
          ? (row.pricing_ctas as { cta_icon?: unknown; cta_text?: unknown; cta_link?: unknown }[]).map((c) => ({
              icon: asImage(c.cta_icon),
              text: asString(c.cta_text),
              link: asLink(c.cta_link),
            }))
          : [],
        cardTitle: asString(row.card_title),
        cardText: asHtml(row.card_text),
        contactCtas: Array.isArray(row.contact_ctas)
          ? (row.contact_ctas as { cta_icon?: unknown; cta_text?: unknown; cta_link?: unknown }[]).map((c) => ({
              icon: asImage(c.cta_icon),
              ctaText: asString(c.cta_text),
              ctaLink: asLink(c.cta_link),
            }))
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
      return null;
  }
}
