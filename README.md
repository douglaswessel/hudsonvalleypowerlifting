# Hudson Valley Powerlifting Website

## Deployment Instructions

### Option 1: Netlify (Recommended - Easiest)

**Step 1: Create Netlify Account**
1. Go to [netlify.com](https://netlify.com)
2. Sign up (free)

**Step 2: Deploy Site**
1. Drag the entire `hvpl-site` folder onto Netlify's dashboard
2. Site deploys instantly
3. You'll get a URL like `random-name-12345.netlify.app`

**Step 3: Connect Domain**
1. In Netlify dashboard → Domain Settings
2. Click "Add custom domain"
3. Enter `hvpowerlifting.com`
4. Follow DNS instructions (update nameservers at your registrar)

**DNS Records to Add:**
```
Type: CNAME
Name: www
Value: [your-site].netlify.app

Type: A (for root domain)
Value: (Netlify provides this)
```

---

### Option 2: Vercel (Also Free)

**Step 1: Create Vercel Account**
1. Go to [vercel.com](https://vercel.com)
2. Sign up

**Step 2: Deploy**
1. Click "Add New Project"
2. Drag folder or connect GitHub
3. Deploy

**Step 3: Connect Domain**
Same as Netlify - update nameservers in Vercel dashboard

---

### Option 3: GitHub Pages (Free, Requires GitHub)

**Step 1: Create GitHub Repository**
1. Go to [github.com](https://github.com)
2. Create new repository named `hvpl-website`
3. Upload all files from `hvpl-site` folder

**Step 2: Enable GitHub Pages**
1. Repository Settings → Pages
2. Source: Deploy from branch `main`
3. Save

**Step 3: Connect Domain**
1. Add `CNAME` file with `hvpowerlifting.com` inside
2. Update DNS at registrar:
```
Type: CNAME
Name: www
Value: [username].github.io

Type: A (for root)
Value: 185.199.108.153
```

---

## DNS Migration from Wix

**Where to Update DNS:**
Find where you bought `hvpowerlifting.com` (likely GoDaddy, Namecheap, etc.)

**Migration Steps:**
1. Deploy new site first (test with temp URL)
2. Update DNS records at registrar
3. Wait 24-48 hours for propagation
4. Keep Wix site live during transition
5. Cancel Wix after new site is live

**Testing Before DNS Switch:**
Use the temporary URL (netlify.app or vercel.app) to verify everything works

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
   `form-name` value so its submissions land in their own Netlify bucket.
2. In `events.html`, copy the `<a class="event-card">` block, point its `href` at the new page, and
   add a matching entry to `EVENT_STATUS` in the script at the bottom (`id`, `closes`, `lastStart`)
   so its status tag and auto-expiry work.
3. Add both to `sitemap.xml`.

### Registration setup

One thing needs doing outside the code:

**1. Turn on Netlify Forms (one time)**
The registration form posts to Netlify Forms under the name `sbd-foundations`.

1. Netlify dashboard → Site configuration → **Forms** → enable form detection
2. Redeploy the site (form detection only picks up forms on a fresh deploy)
3. Forms → `sbd-foundations` → **Add notification** → email to `hudsonvalleypowerlifting@gmail.com`

Until form detection is on, submissions fail — the page catches this and tells registrants to text
the gym instead, so nobody is lost, but you'll want it enabled before promoting the page.

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

**Heads up on the confirmation email:** Netlify Forms notifies *you* when someone registers — it does
not automatically reply to the registrant. So a confirmation email carrying the Venmo link has to be
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
