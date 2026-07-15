# Engineering Calculator Hub — Go-to-Market Plan

Updated: 15 July 2026

## Positioning

**Category:** a transparent electrical/electronics calculation workspace, not another generic calculator directory.

**Promise:**

> Fast enough for a calculator. Rigorous enough for a design review.

**Primary customer:** independent electrical/electronics engineers, technicians, hardware consultants, and small product teams.

**Acquisition audience:** engineering students, makers, and junior engineers who discover individual free calculators through search.

**Why this wedge:** commodity formulas are already free at enormous scale. Omni publishes thousands of calculators, while DigiKey and Texas Instruments use calculators as free acquisition tools. Paid engineering products earn their price through projects, unit safety, audit trails, reports, templates, and collaboration.

## Offer and pricing test

| Plan | Launch offer | What it sells |
| --- | ---: | --- |
| Free | $0 | All deterministic calculators, worked steps, local projects, CSV/JSON/PDF-ready export |
| Founding Pro | US$9/month | Secure cloud backup, up to 100 synced projects, device-to-device recovery, cloud-backed worksheets, priority requests |
| Annual Pro | Test US$72/year | Two months effectively free versus monthly; launch only after monthly conversion is proven |
| Team | Target US$24/user/month | Add only after shared templates, review/approval, history, and branded reports ship |
| Embed / Partner | From US$199/month + setup | White-label or attributed calculators for manufacturers, distributors, and engineering publishers |

Avoid lifetime pricing. It creates permanent support obligations without recurring revenue.

## Conversion funnel

1. **Search landing:** a specific, technically deep free calculator page.
2. **Activation:** a successful calculation with transparent steps and a relevant design warning.
3. **Habit:** “Save to workspace” turns the result into a named project sheet.
4. **Value moment:** the user adds a second calculation or note to the same project.
5. **Signup:** offer cloud backup after meaningful local work exists.
6. **Paid conversion:** sell recovery and continuity, not access to a commodity formula.
7. **Retention:** prompt users to reopen recent projects and add the next related calculation.

Track these events in order: `calculation_completed`, `workspace_saved`, `project_second_entry`, `account_started`, `checkout_started`, `subscription_active`, `cloud_saved`, `cloud_loaded`.

## First four content clusters

Publish fewer, deeper pages. Every page should have a distinct tool, derivation, assumptions, limits, verification case, and worked design example.

### DC and passives

- Design a 12 V to 3.3 V ADC divider with E24 values and input loading
- Why a “10× load” rule is not enough for every voltage divider
- LED resistor design across supply and forward-voltage tolerances
- When resistor power rating, not resistance, sets the design

### PCB power integrity

- PCB trace voltage drop versus temperature and finished copper thickness
- How neck-downs and vias change a DC resistance estimate
- Choosing trace width when voltage drop matters more than temperature rise

### Signals and conversion

- RC low-pass cutoff, settling time, and ADC source impedance
- How capacitor tolerance moves filter cutoff
- ADC resolution versus real accuracy: LSB, INL, noise, and reference error
- Series RLC Q and bandwidth including real component losses

### Power and batteries

- Battery runtime: why Ah × V ÷ W is only the starting point
- Three-phase kW, kVA, kVAr, power factor, and efficiency
- Building a load budget with usable capacity and conversion loss

## 90-day commercial sequence

### Days 1–14: validate the offer

- Deploy v2 and configure the real domain, Supabase migration, Stripe recurring price, Billing Portal, and webhook events.
- Complete an end-to-end Stripe test-mode run: subscribe, duplicate-subscribe rejection, webhook retry, Pro activation, cancellation, and portal return.
- Have an Australian lawyer review the operator identity/contact details, Terms, Privacy Policy, renewal/refund language, and consumer-law obligations before taking live payments.
- Decide with an accountant and insurance adviser how the business, tax, professional-liability, and cyber risks should be structured; do not infer those requirements from this repository.
- Upgrade and test database backup/restore before cloud projects become a customer's only copy.
- Add privacy-friendly product analytics for the funnel events above.
- Recruit 10–15 working electrical/electronics engineers for 20-minute workflow interviews.
- Ask each person to bring one calculation they repeat monthly.
- Offer the first 100 customers a founding annual price, not lifetime access.

### Days 15–45: prove repeated use

- Publish the four highest-intent design guides above.
- Add recent-project reopening and a first reusable project template.
- Publish verification cases for each professional tool, including reference inputs and expected outputs.
- Measure the percentage of completed calculations saved to a project and the percentage of projects receiving a second entry.

### Days 46–90: grow distribution

- Offer free attributed embeds to engineering educators and niche technical publishers.
- Contact component manufacturers with one concrete calculator concept tied to their product-selection workflow.
- Build the first paid white-label pilot only after receiving a signed design-partner commitment.
- Add Team features only if individual users repeatedly ask to share, review, or standardise project sheets.

## Outreach templates

### Engineer interview

> I’m building a transparent electrical calculation workspace: the formulas are free, but projects, assumptions, and review-ready sheets stay connected. Could I watch you recreate one calculation you repeat in real work? I’m looking for the awkward parts, not compliments.

### Manufacturer partner

> Your customers already calculate [specific design decision] before choosing [product family]. I can build a technically reviewed calculator that keeps your product-selection data inside that workflow, with an attributed free version and a white-label lead-capture option. Would a 20-minute scope review be useful?

## Evidence and current benchmarks

- [Omni Calculator usage and calculator count](https://www.omnicalculator.com/omni-by-the-numbers)
- [DigiKey online conversion calculators](https://www.digikey.com/en/resources/online-conversion-calculators)
- [Texas Instruments Analog Engineer's Calculator](https://www.ti.com/tool/ANALOG-ENGINEER-CALC)
- [Wolfram|Alpha Pro pricing](https://www.wolframalpha.com/pro/pricing/)
- [CalcTree pricing](https://www.calctree.com/pricing)
- [ClearCalcs pricing](https://www.clearcalcs.com/pricing)
- [Google guidance on helpful, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google spam policies for scaled low-value content](https://developers.google.com/search/docs/essentials/spam-policies)

## Trust constraints

- Do not claim professional certification or code compliance without a qualified reviewer and documented standard/version.
- Keep deterministic calculations separate from optional AI explanation.
- Publish assumptions, limitations, units, and verification cases.
- Never fabricate ratings, review counts, customer logos, or usage metrics.
- Treat standards-based structural/civil tools as a later, separately reviewed product surface.
- Do not claim that Terms, disclaimers, automated tests, or security controls eliminate legal or cyber risk.
- Keep live secrets in Vercel's encrypted Production scope, enable the prepared API firewall rule, and rehearse credential rotation and incident response.
