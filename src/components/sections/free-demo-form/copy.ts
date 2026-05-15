import type { Locale } from "@/lib/i18n/locales";

export type SalonTypeSlug = "hair" | "beauty" | "barber" | "nails" | "other";

export type FreeDemoFormCopy = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  salonType: string;
  salonOptions: Record<SalonTypeSlug, string>;
  hasWebsiteQuestion: string;
  yes: string;
  no: string;
  websiteUrl: string;
  websitePlaceholder: string;
  submit: string;
  sending: string;
  thankYouTitle: string;
  successDefault: string;
  errorGeneric: string;
  formNotConfigured: string;
};

const nl: FreeDemoFormCopy = {
  firstName: "Voornaam",
  lastName: "Achternaam",
  email: "E-mailadres",
  phone: "Telefoonnummer",
  salonType: "Type salon",
  salonOptions: {
    hair: "Kapsalon",
    beauty: "Schoonheidssalon",
    barber: "Barbershop",
    nails: "Nagelstudio",
    other: "Anders",
  },
  hasWebsiteQuestion: "Wat is de URL van je huidige website?",
  yes: "Ja",
  no: "Nee",
  websiteUrl: "URL van je huidige website",
  websitePlaceholder: "Bijv. www.jouw-salon.nl",
  submit: "Stuur mij de gratis demo",
  sending: "Versturen…",
  thankYouTitle: "Bedankt!",
  successDefault:
    "Je aanvraag is binnen. Je ontvangt de demo-video op het e-mailadres dat je hebt ingevuld.",
  errorGeneric: "Er ging iets mis. Probeer het later opnieuw.",
  formNotConfigured: "Koppel eerst een gepubliceerd formulier in WordPress (ACF: OMB-formulier).",
};

const en: FreeDemoFormCopy = {
  firstName: "First name",
  lastName: "Last name",
  email: "Email address",
  phone: "Phone number",
  salonType: "Salon type",
  salonOptions: {
    hair: "Hair salon",
    beauty: "Beauty salon",
    barber: "Barbershop",
    nails: "Nail studio",
    other: "Other",
  },
  hasWebsiteQuestion: "What is the URL of your current website?",
  yes: "Yes",
  no: "No",
  websiteUrl: "URL of your current website",
  websitePlaceholder: "Example: www.yoursalon.com",
  submit: "Send me the free demo",
  sending: "Sending…",
  thankYouTitle: "Thank you!",
  successDefault: "Your request was received. We will send the demo video to the email address you provided.",
  errorGeneric: "Something went wrong. Please try again later.",
  formNotConfigured: "Connect a published OMB Form Builder form in WordPress (ACF: OMB form).",
};

export function getFreeDemoFormCopy(lang: Locale): FreeDemoFormCopy {
  return lang === "en" ? en : nl;
}
