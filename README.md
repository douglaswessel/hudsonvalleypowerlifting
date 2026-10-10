# Hudson Valley Powerlifting Website

## Hosting & Deployment

The site is hosted on **Cloudflare Pages** (project `hvpowerlifting`, Cloudflare account
hudsonvalleypowerlifting@gmail.com). It moved off Netlify in October 2026 after Netlify suspended
the free site for exceeding usage.

**Deploy:** run `./deploy.sh` (needs `npx wrangler login` as the gym account once). The script
copies the site to a temp folder so `.git`, this README, and the script itself are never published.
Don't run `wrangler pages deploy .` or `wrangler deploy` from the repo root.

- Production: https://www.hvpowerlifting.com (also https://hvpowerlifting.pages.dev)
- Pages serves clean URLs: `/members` serves `members.html`, and `/members.html` 308-redirects to
  `/members`. Link to the clean form everywhere (nav, canonical tags, sitemap).
- `404.html` is the not-found page. Without it Pages would serve the home page for every bad URL.
- `_headers` sets security and image cache headers.
- Keep every image under 25 MB (Pages' per-file limit). Resize photos to about 2000px on the long
  edge before adding them: `sips -Z 2000 -s formatOptions 72 photo.jpg`.

### Domain & DNS

`hvpowerlifting.com` is registered at **Wix**, and DNS stays at Wix (Wix doesn't allow nameserver
changes). Records:

| Host | Type | Value | Purpose |
|---|---|---|---|
| `www` | CNAME | `hvpowerlifting.pages.dev` | The site (canonical host) |
| `@` | A | `167.172.5.31` | ForwardDomain.net, redirects the bare domain to www |
| `fwd` | TXT | `http-status=301;forward-domain=https://www.hvpowerlifting.com/*` | ForwardDomain target |

The domain has no MX or TXT email records; the gym uses Gmail. A later option is transferring the
domain to Cloudflare Registrar, which lets Pages serve the bare domain directly and drops the
ForwardDomain dependency.

---

## File Structure

```
hvpl-site/
├── index.html               # Home page
├── events.html              # Events listing (index of all events)
├── event-sbd-foundations.html   # Event detail page + registration form
├── events-registered.html   # Post-registration payment page (no-JS form fallback)
├── members.html             # Memberships & pricing
├── training.html            # Training & coaching
├── equipment.html           # Equipment list
├── team.html                # Coaches
├── contact.html             # Contact & location
├── images/
│   └── HVPL_Logo.png       # Logo
└── README.md               # This file
```

---

## Events Pages

Events are split in two:

- **`events.html`** — the listing. One card per event, linked from the main nav. Cards show their own
  registration status and drop off the "Upcoming" list automatically once the event has passed.
- **`event-sbd-foundations.html`** — the detail page for the current series, including the
  registration form and waiver. Each future event gets its own `event-*.html` page.

### Adding a new event

1. Copy `event-sbd-foundations.html` to `event-<slug>.html` and edit the copy: hero copy, session
   cards, `SESSIONS` / `PRICES` in the script, the `Event` JSON-LD blocks in `<head>`, and the
   `canonical` / `og:url` / breadcrumb URLs. Give the form a new `name=` and matching
   `form-name` value so its submissions land in their own sheet tab (and add the event to `EVENTS` in
   `registration/Code.gs`).
2. In `events.html`, copy the `<a class="event-card">` block, point its `href` at the new page, and
   add a matching entry to `EVENT_STATUS` in the script at the bottom (`id`, `closes`, `lastStart`)
   so its status tag and auto-expiry work.
3. Add both to `sitemap.xml`.

### Registration setup

Registrations go to a Google Sheet through a Google Apps Script web app, which also emails the gym
and sends each registrant a confirmation with their Venmo payment link. Setup, redeploy steps and
limits are in [`registration/README.md`](registration/README.md).

To open sign-ups for an event: make sure `REGISTRATION_ENDPOINT` is set at the bottom of the event
page, then set `REGISTRATION_OPEN = true` and deploy.

### Payment (Venmo)

Payments go to **https://venmo.com/u/Heather-Monkey**. After a successful registration the
confirmation screen shows the exact amount owed, the account, and a **Pay $X with Venmo** button.
The same details are on `events-registered.html` for anyone with JavaScript off.

Config lives at the bottom of `event-sbd-foundations.html`:

```js
const VENMO_PROFILE_URL = 'https://venmo.com/u/Heather-Monkey';
const VENMO_USERNAME = 'Heather-Monkey';
const VENMO_PREFILL = true;
```

With `VENMO_PREFILL` on, the button uses Venmo's prefill URL —
`https://venmo.com/?txn=pay&recipients=<user>&amount=<amt>&note=<note>` — which opens the payment
screen with the amount and note already entered. Confirmed working on mobile with the Venmo app.
Set it to `false` and the button falls back to `VENMO_PROFILE_URL`, which always resolves but fills
nothing in.

`events-registered.html` (the no-JS fallback) uses the plain profile link, since that page has no way
to know which sessions were picked and therefore can't prefill an amount — it lists all three prices
instead. Changing the account means updating the two constants here plus that hardcoded link.

**Confirmation email:** the Apps Script emails each registrant their amount and a Venmo button
(see `registration/README.md`). Older note, kept for context: Netlify Forms only notified the gym
and did not reply to the registrant. So a confirmation email carrying the Venmo link has to be
sent either by hand from the Netlify submission, or by wiring an automation (Netlify Function, Zapier,
or Make) onto the form. Until that exists, the payment details on the confirmation screen are what
registrants actually see, which is why they're spelled out there in full.

**Updating the series later**
Session dates, times, and labels live in the `SESSIONS` object in the script at the bottom of
`event-sbd-foundations.html`, and prices in `PRICES` (`1: 50, 2: 100, 3: 125`). Each session's registration closes
automatically 48 hours before its start time — closed sessions grey out on their own, and once all
sessions have passed the form disables itself with a "text us about the next one" message.
Session copy also appears in the card markup and the JSON-LD `Event` blocks in `<head>`, and the
summary on the listing card in `events.html`.

---

## After Deployment

**Add Real Images:**
1. Take photos of gym
2. Replace placeholder backgrounds in HTML
3. Upload updated files

**Add Google Map:**
In `contact.html`, replace map placeholder with:
```html
<iframe 
  src="https://www.google.com/maps/embed?pb=YOUR_EMBED_CODE" 
  width="100%" 
  height="500" 
  style="border:0;" 
  allowfullscreen="" 
  loading="lazy">
</iframe>
```
Get embed code from Google Maps

**Social Media Links:**
Update in footer sections of all pages:
- Facebook: Replace `#` with your Facebook URL
- Instagram: Replace `#` with your Instagram URL

---

## Support

**Need Help?**
- Netlify docs: [docs.netlify.com](https://docs.netlify.com)
- Vercel docs: [vercel.com/docs](https://vercel.com/docs)
- GitHub Pages: [pages.github.com](https://pages.github.com)

**Common Issues:**
- DNS not updating: Wait 48 hours, clear browser cache
- Images not loading: Check file paths are lowercase
- Form not working: Need backend (use Netlify Forms or Formspree)
