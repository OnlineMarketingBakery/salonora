# Merged FAQ content (review)

Harvested **2026-06-04** from:

| Source | URL | Result |
|--------|-----|--------|
| Live | `https://salonora.eu/faqs`, `/en/faqs`, `/nl/veelgestelde-vragen` | **404** (FAQ pages not on live yet) |
| Staging | `https://staging.salonora.eu/en/faqs`, `/nl/veelgestelde-vragen` | Page loads; **13 EN questions** visible (WP returns EN for NL) |
| WordPress API | `veelgestelde-vragen` (NL), `faqs` (EN) | **13 items** each; NL rows still English in CMS |
| Bundled | `src/lib/legal/faq-data.json` (prior homepage harvest) | **13 NL + 13 EN** — best NL copy |

**Merge rule:** Prefer bundled NL for Dutch; bundled EN for English; drop duplicate “Meer vragen?” / “More questions?” from accordion (moved to bottom CTA only). Added **“Wat is Salonora?” / “What is Salonora?”** for the General category. Longer answer wins on duplicates.

**Accordion count:** 13 per language (badge auto-calculated).

---

## Nederlands (13)

### Algemeen

1. **Wat is Salonora?**  
   Salonora is het platform voor kappers-, nagel-, barber- en beauty-salons: een professionele website met online boekingen, hosting en support — zonder technische kennis.

2. **Waarom zijn jullie anders dan andere webbureaus?**  
   Wij werken alleen voor salons: kappers, nagelstudio's, barbershops en beauty. Wij kennen jouw branche en weten precies wat jouw klanten nodig hebben — geen generieke templates of losse plugins.

3. **Is er een minimale looptijd?**  
   Ja, er geldt een minimale looptijd van één jaar. Daarna is het maandelijks opzegbaar. Eerlijk en duidelijk.

### Prijzen

4. **Blijven de prijzen zo laag?**  
   Eerlijk gezegd: de prijzen gaan in de toekomst omhoog terwijl wij het platform verder uitbouwen. Wie nu instapt, behoudt zijn prijs — voor altijd.

5. **Wat kost Salonora?**  
   Het basistarief is €50 per maand, live binnen 48 uur, en u kunt maandelijks opzeggen. Het volledige pakket staat op de homepage onder *Wat zijn de kosten?*

### Technisch

6. **Moet ik technisch zijn?**  
   Nee, dat hoef je niet. De boekingsmodule stel je zelf in naar jouw wensen. Wij regelen setup, hosting en je website — zonder code.

7. **Hoe lang duurt het voordat mijn site live is?**  
   In de regel binnen 48 uur na aanmelding, zodra we uw gegevens en wensen hebben ontvangen.

### Functies

8. **Kan ik al mijn diensten op de site zetten?**  
   Ja. U kunt diensten, duur en prijzen instellen zodat klanten direct de juiste behandeling boeken.

9. **Werkt dit met meerdere kappers of stylisten?**  
   Ja. Klanten kunnen een voorkeur aangeven en u plant afspraken per medewerker met eigen agenda's.

10. **Kunnen klanten terugkerende afspraken inplannen?**  
    Waar uw salon dat aanbiedt, ondersteunt het systeem terugkerende boekingen volgens uw instellingen.

11. **Kan ik walk-ins en online boekingen combineren?**  
    Ja. Geblokkeerde tijden en handmatige afspraken kunnen naast online boekingen bestaan.

### Aan de slag

12. **Wat als ik al een website heb?**  
    We kunnen uw bestaande domein koppelen en u helpen overstappen zonder dat klanten uw URL hoeven te onthouden.

13. **Kan ik het zelf aanpassen? Ja, dat kan! En heb je een kleine wijziging nodig?**  
    Dan kijken wij gewoon met je mee. Helemaal geen gedoe. Je kunt diensten, teksten en beschikbaarheid zelf bijwerken; voor grotere wijzigingen helpen wij graag.

---

## English (13)

### General

1. **What is Salonora?**  
   Salonora is the platform for hair, nail, barber and beauty salons: a professional website with online booking, hosting and support — no technical knowledge required.

2. **How does Salonora stand out from other web agencies?**  
   We only work for salons — hair, nails, barbers and beauty. We know your industry and what your clients need, not generic templates or disconnected plugins.

3. **Is there a minimum contract term?**  
   Yes. There is a minimum term of one year. After that you can cancel month to month. Clear and fair.

### Pricing

4. **Will prices stay this low?**  
   Honestly, prices will increase over time as we grow the platform. Salons who join now keep their price — for good.

5. **What does Salonora cost?**  
   From €50 per month, live within 48 hours, and you can cancel month to month. See the *What are the costs?* section on our homepage for everything included.

### Technical

6. **Do I need to be technical?**  
   No. You configure the booking module to your preferences. We handle setup, hosting and your website — no code required.

7. **How long until my site is live?**  
   Typically within 48 hours after sign-up, once we have your details and preferences.

### Features

8. **Can I list all my services?**  
   Yes. Set services, duration and pricing so clients book the right treatment.

9. **Does it work with multiple stylists?**  
   Yes. Clients can express a preference and you schedule per team member with separate calendars.

10. **Can clients book recurring appointments?**  
    Where your salon offers that, the system supports recurring bookings per your settings.

11. **Can I combine walk-ins and online booking?**  
    Yes. Blocked times and manual appointments work alongside online bookings.

### Getting started

12. **What if I already have a website?**  
    We can connect your existing domain and help you switch without confusing your clients.

13. **Can I change things myself? What if I only need a small tweak?**  
    Yes — and we're happy to help with small changes. You can update services, copy and availability yourself; we're here for bigger updates too.

---

## Not in accordion (CTA banner only)

- **NL:** Meer vragen? → mail info@salonora.nl / hoi@salonora.nl  
- **EN:** More questions? → same emails + contact link when configured
