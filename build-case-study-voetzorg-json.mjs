import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const dataDir = path.join(ROOT, "scripts", "data");

const BODY_P1 =
  "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful.";
const BODY_P2 =
  "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself.";
const QUOTE =
  "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally.";

function twoP(a, b) {
  return `<p>${a}</p>\n<p>${b}</p>\n`;
}

const nl = {
  post_id: 44051,
  slug: "hoe-voetzorg-roermond-hun-boekingservaring-transformeerde",
  title: "Hoe Voetzorg Roermond hun boekingservaring transformeerde",
  excerpt:
    "Voetzorg Roermond transformeerde hun boekingservaring met Salonora — minder administratie, meer online afspraken en een professionelere klantervaring.",
  yoast_title: "Hoe Voetzorg Roermond hun boekingservaring transformeerde - Salonora",
  yoast_metadesc:
    "Ontdek hoe Voetzorg Roermond hun boekingservaring transformeerde met Salonora: 42% kostenbesparing, 2 maanden terugverdientijd en 85% meer boekingen.",
  media_files: {
    hero: "hero.png",
    product_shot: "product-shot-composite.png",
    video_poster: "video-poster.png",
    avatar: "avatar.png",
  },
  acf: {
    case_study_project_label: "Project: Voetzorg Roermond",
    case_study_lead: twoP(BODY_P1, BODY_P1),
    case_study_outcome_metrics: [
      { metric_label: "Kostenbesparing", metric_value: "42%" },
      { metric_label: "Terugverdientijd", metric_value: "2 maanden" },
      { metric_label: "Algehele ROI", metric_value: "2.5x" },
      { metric_label: "Meer boekingen", metric_value: "85%" },
    ],
    show_toc: true,
    breadcrumb_parent: "",
    show_related_case_studies: false,
    featured_form: false,
    case_study_sections: [
      {
        acf_fc_layout: "case_study_chapter",
        heading: "Probleem",
        body: twoP(BODY_P1, BODY_P2),
        show_divider_after: true,
      },
      {
        acf_fc_layout: "case_study_chapter",
        heading: "Oplossing",
        body: twoP(BODY_P1, BODY_P2),
        show_divider_after: true,
      },
      {
        acf_fc_layout: "case_study_product_shot",
        title: "Hoe Salonora Boekingsmodule Voetzorg helpt",
        description: twoP(BODY_P1, BODY_P2),
        show_divider_after: true,
        image_key: "product_shot",
      },
      {
        acf_fc_layout: "case_study_chapter",
        heading: "Resultaat",
        body: twoP(BODY_P1, BODY_P2),
        show_divider_after: true,
      },
      {
        acf_fc_layout: "case_study_client_review",
        section_heading: "Klantenrecensie",
        video_url: "",
        quote: `<p>${QUOTE}</p>\n`,
        person_name: "Melanie Koelemeijer",
        person_role: "Voetzorg Roermond",
        video_poster_key: "video_poster",
        person_photo_key: "avatar",
      },
      {
        acf_fc_layout: "case_study_conversion_cta",
        title: "Wilt u dezelfde resultaten voor uw salon?",
        subtitle:
          "<p>Salonora helpt je meer klanten aan te trekken, boekingen te beheren en je bedrijf te laten groeien – zonder gedoe.</p>\n",
        cta: {
          title: "Boek een Demo",
          url: "https://backend.salonora.eu/nl/demo-pagina/",
          target: "",
        },
      },
    ],
  },
};

const en = {
  post_id: 141710,
  slug: "how-voetzorg-roermond-transformed-their-booking-experience",
  title: "How Voetzorg Roermond transformed their booking experience",
  excerpt:
    "Voetzorg Roermond transformed their booking experience with Salonora — less admin, more online appointments, and a smoother client journey.",
  yoast_title: "How Voetzorg Roermond transformed their booking experience - Salonora",
  yoast_metadesc:
    "Discover how Voetzorg Roermond transformed their booking experience with Salonora: 42% cost savings, 2-month payback, and 85% more bookings.",
  media_files: {
    hero: "hero.png",
    product_shot: "product-shot-composite.png",
    video_poster: "video-poster.png",
    avatar: "avatar.png",
  },
  acf: {
    case_study_project_label: "Project: Voetzorg Roermond",
    case_study_lead: twoP(BODY_P1, BODY_P1),
    case_study_outcome_metrics: [
      { metric_label: "Cost savings", metric_value: "42%" },
      { metric_label: "Payback period", metric_value: "2 months" },
      { metric_label: "Overall ROI", metric_value: "2.5x" },
      { metric_label: "More bookings", metric_value: "85%" },
    ],
    show_toc: true,
    breadcrumb_parent: "",
    show_related_case_studies: false,
    featured_form: false,
    case_study_sections: [
      {
        acf_fc_layout: "case_study_chapter",
        heading: "Problem",
        body: twoP(BODY_P1, BODY_P2),
        show_divider_after: true,
      },
      {
        acf_fc_layout: "case_study_chapter",
        heading: "Solution",
        body: twoP(BODY_P1, BODY_P2),
        show_divider_after: true,
      },
      {
        acf_fc_layout: "case_study_product_shot",
        title: "How Salonora booking module helps Voetzorg",
        description: twoP(BODY_P1, BODY_P2),
        show_divider_after: true,
        image_key: "product_shot",
      },
      {
        acf_fc_layout: "case_study_chapter",
        heading: "Results",
        body: twoP(BODY_P1, BODY_P2),
        show_divider_after: true,
      },
      {
        acf_fc_layout: "case_study_client_review",
        section_heading: "Client review",
        video_url: "",
        quote: `<p>${QUOTE}</p>\n`,
        person_name: "Melanie Koelemeijer",
        person_role: "Voetzorg Roermond",
        video_poster_key: "video_poster",
        person_photo_key: "avatar",
      },
      {
        acf_fc_layout: "case_study_conversion_cta",
        title: "Want the same results for your salon?",
        subtitle:
          "<p>Salonora helps you attract more clients, manage bookings effortlessly, and grow your business — without the hassle.</p>\n",
        cta: {
          title: "Book a Demo",
          url: "https://backend.salonora.eu/demo-page/",
          target: "",
        },
      },
    ],
  },
};

fs.writeFileSync(path.join(dataDir, "case-study-voetzorg-nl.json"), `${JSON.stringify(nl, null, 2)}\n`);
fs.writeFileSync(path.join(dataDir, "case-study-voetzorg-en.json"), `${JSON.stringify(en, null, 2)}\n`);
console.log("Wrote valid JSON bundles");
