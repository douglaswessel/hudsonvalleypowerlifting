---
title: "HVPL Website Migration: Netlify to Cloudflare Pages"
subtitle: "Hudson Valley Powerlifting, 155 Vineyard Ave, Highland, NY"
date: "October 10, 2026 (v2, as built)"
---

# HVPL Website Migration: Netlify to Cloudflare Pages

| | |
|---|---|
| **Business** | Hudson Valley Powerlifting (HVPL), 155 Vineyard Ave, Highland, NY |
| **Document owner** | Doug Wessel (co-owner, technical lead) |
| **Business approver** | Brandon LaCroix (co-owner) |
| **Status** | **Migrated and live, October 10, 2026.** A few follow-ups remain (Section 9) |
| **Before** | Static site on Netlify (free plan). Domain registered at Wix, using Wix DNS, with A/CNAME records pointing to Netlify |
| **After** | Static site on **Cloudflare Pages** (free plan), deployed from the Git repo with `./deploy.sh`. Domain is still registered at Wix and still uses Wix DNS. `www.hvpowerlifting.com` is the main address |

> **v1 → v2:** v1 of this document planned a move to Vercel Pro. Two things changed the plan on the day
> (Section 2): Netlify had already **taken the site offline** for exceeding its usage limits, and
> Vercel's free plan doesn't allow business use. We went to Cloudflare Pages instead, which is free,
> has unlimited bandwidth, and allows commercial use.

---

## Plain-English summary (for Brandon)

- **What happened:** On October 10 the website was down. Netlify, the old host, had switched it off for
  using too much bandwidth. The cause was full-size photos (one headshot alone was 35 MB). We shrank the
  photos by about 93% with no visible difference and moved the site to Cloudflare, which is free and
  has no bandwidth limit. The site was back up the same day.
- **The address:** The site's main address is now **www.hvpowerlifting.com**. Typing
  `hvpowerlifting.com` still works and forwards to the `www` address. Old links (`/members.html` and so
  on) still work too.
- **The domain:** It's still registered at Wix and renews there. Keep auto-renew on.
- **Event sign-ups:** Registrations now go into a Google Sheet called **"HVPL Event Registrations"**
  in the gym Google account. Each sign-up adds a row with a **Paid?** checkbox, emails the gym, and
  emails the registrant a confirmation with a Venmo button for the exact amount. Tick **Paid?** when
  the Venmo payment arrives.
- **Cost:** $0/month for hosting. The Wix domain renewal is unchanged.
- **What we need from you:** The Google Business Profile website link has already been updated to
  `https://www.hvpowerlifting.com/`. If anything looks off on the site, text Doug.
  **Never change DNS records in Wix without Doug.**

---

## 1. Goals and results

| # | Goal / success criterion | Result |
|---|---|---|
| S1 | The site loads over HTTPS with a valid certificate on both hosts, and one redirects to the other in a single hop | ✅ `https://www.hvpowerlifting.com` returns 200 (Cloudflare, Let's Encrypt cert). `hvpowerlifting.com` (http and https) redirects to `https://www.hvpowerlifting.com/` |
| S2 | No broken URLs | ✅ Old `/*.html` URLs redirect (308) to clean paths (`/members`). Unknown URLs return a real 404 page |
| S3 | Form submissions reach the gym | ✅ Replaced Netlify Forms with Google Sheet + Apps Script. Tested end to end (sheet row, gym email, registrant email, Venmo link) |
| S4 | No email disruption | ✅ The domain has no MX or email records, so there was nothing to break |
| S5 | No performance regression | ✅ Pages are much lighter: images went from 110 MB to 7.3 MB |
| S6 | No Search Console errors spike | ⏳ Watch through about Nov 7 (Section 9) |
| S7 | Netlify decommissioned, access documented | ⏳ Delete the Netlify site around Oct 24 (Section 9) |

**Non-goals (unchanged):** no redesign, no change to how the gym does email, no new features.
Registration was rebuilt only because Netlify Forms doesn't work outside Netlify.

---

## 2. What changed from the v1 plan, and why

| Area | v1 plan | As built | Why |
|---|---|---|---|
| Host | Vercel Pro (~$20/mo) | **Cloudflare Pages, free plan** | Vercel Hobby is non-commercial only. Cloudflare's free plan allows business use and has unlimited bandwidth |
| Timeline | 3 weeks, Netlify kept live as a rollback target | **Same-day cutover** | Netlify had already suspended the site (`usage_exceeded`), so there was no uptime left to protect and no rollback target |
| Canonical host | Keep the apex (`hvpowerlifting.com`) | **`www.hvpowerlifting.com`** | Cloudflare Pages can only serve the bare domain when Cloudflare runs the DNS, and Wix doesn't allow nameserver changes. `www` works with a plain CNAME at Wix |
| Bare-domain redirect | Handled by the host | **ForwardDomain.net** (free, DNS-based 301 redirect) | Wix's own forwarding wasn't used. ForwardDomain only needs an A record and a TXT record |
| URL format | Keep `.html` URLs | **Clean URLs** (`/members`) | Pages serves and redirects to clean URLs automatically. Canonicals, sitemap and links were updated to match |
| Forms | Formspree or Vercel Function + Resend | **Google Sheet + Apps Script** | Free, owned by the gym's Google account, gives a roster with payment tracking, and sends registrants a confirmation with the Venmo link (Formspree's free tier doesn't) |
| Images | Out of scope | **Resized to 2000px long edge** | They caused the Netlify shutdown, and Cloudflare has a 25 MB per-file limit |

---

## 3. Discovery findings (Oct 10, 2026)

| Item | Finding |
|---|---|
| Domain | `hvpowerlifting.com`, **registered at Wix**, Wix nameservers `ns6`/`ns7.wixdns.net` (assumptions A1 and A2 confirmed) |
| "Forwarding" | It wasn't forwarding: apex A record `75.2.60.5` (Netlify) and `www` CNAME `cozy-otter-7b025d.netlify.app`, TTL 3600 |
| Email | No MX, SPF, DKIM or DMARC records. The gym uses `hudsonvalleypowerlifting@gmail.com` (A5 confirmed) |
| Stack | Plain static HTML, no build step (A3) |
| Repo | `github.com/douglaswessel/hudsonvalleypowerlifting`, under Doug's personal account (A4; see Section 9) |
| Netlify features | **Netlify Forms only**, used by the SBD Foundations registration form. No `netlify.toml`, redirects, headers, functions, Identity, CMS or analytics |
| Canonical host (old) | Apex: `https://hvpowerlifting.com/*.html` in canonical tags and the sitemap |
| Search Console (old) | URL-prefix property verified by the `google012bd5c6a6df0e5c.html` file |
| Site state | **Down:** Netlify returned `503 {"error":"usage_exceeded"}` on every host |
| Root cause | `images/` was 110 MB, including a 35 MB headshot and several 6–8 MB photos at 6000px |

---

## 4. Architecture (as built)

```
                    Visitor's browser
                           |
              DNS lookup (Wix DNS, nameservers unchanged)
            /                                        \
 hvpowerlifting.com                          www.hvpowerlifting.com
   A 167.172.5.31                             CNAME hvpowerlifting.pages.dev
   (ForwardDomain.net)                                 |
   301 -> https://www.hvpowerlifting.com/<path>        |
            \__________________________________________/
                           |
          Cloudflare Pages project "hvpowerlifting"
          (account: hudsonvalleypowerlifting@gmail.com, free plan)
            - static HTML + images, auto HTTPS (Let's Encrypt)
            - clean URLs (/members), 404.html, _headers
                           |
          Event registration form (fetch POST)
                           |
          Google Apps Script web app (runs as the gym Gmail)
            -> "HVPL Event Registrations" Google Sheet (tab per event, Paid? checkbox)
            -> email to the gym  +  confirmation email to registrant (Venmo link)

 Unchanged: Wix registration and auto-renew, Wix nameservers, no email records
 Source of truth: GitHub repo (main branch); deploy with ./deploy.sh
```

---

## 5. DNS (Wix → Domains → hvpowerlifting.com → Manage DNS Records)

| Host | Type | Value | Purpose |
|---|---|---|---|
| `www` | CNAME | `hvpowerlifting.pages.dev` | The website (main address) |
| `@` (Host blank) | A | `167.172.5.31` | ForwardDomain.net: redirects the bare domain to `www` |
| `fwd` | TXT | `http-status=301;forward-domain=https://www.hvpowerlifting.com/*` | Tells ForwardDomain where to redirect, and to use a permanent 301 |
| `@` (Host blank) | TXT | `google-site-verification=q8ZhfB-…` | Verifies the Google Search Console **Domain** property. **Don't delete it** |

There are no AAAA, MX or CAA records. Rollback values (old Netlify records) are kept for reference
only, since Netlify is suspended: apex A `75.2.60.5`, `www` CNAME `cozy-otter-7b025d.netlify.app`.

**Note:** ForwardDomain caches DNS records for up to 24 hours, and there's no way to flush that
cache. After you change the `fwd` TXT record, the redirect can keep its old behavior (e.g. 302
instead of 301) for up to a day. ForwardDomain is a free service with no uptime guarantee. That risk
goes away if the domain moves to Cloudflare Registrar (Section 9).

---

## 6. Feature mapping (Netlify → Cloudflare)

| Netlify feature | As built on Cloudflare | Where |
|---|---|---|
| Drag-and-drop / Git deploys | `./deploy.sh` (Wrangler CLI, Cloudflare's command-line tool), run from the repo | `deploy.sh` |
| Pretty URLs | Pages serves `/members` from `members.html` and 308-redirects `/members.html` → `/members` | Built into Pages |
| Custom 404 | `404.html` (without it, Pages serves the home page for unknown URLs, which Google treats as a "soft 404") | `404.html` |
| Headers | `X-Content-Type-Options`, `Referrer-Policy`, 7-day cache on `/images/*` | `_headers` |
| Netlify Forms | Google Apps Script web app + Google Sheet + MailApp emails | `registration/Code.gs`, `registration/README.md` |
| Deploy previews | `wrangler pages deploy --branch <name>` creates `<name>.hvpowerlifting.pages.dev` (with `X-Robots-Tag: noindex`) | On demand |
| Rollback | Cloudflare dashboard → Pages → hvpowerlifting → Deployments → pick an earlier one → **Rollback** | Dashboard |
| Analytics | None before. Optional: turn on Cloudflare Web Analytics (free) | Section 9 |

---

## 7. Runbooks

### 7.1 Deploy a change (Doug)
1. Edit the files in `~/Projects/HVPL/hvpl-site`, commit, and push to `main`.
2. Run `./deploy.sh`. The first time on a new machine, run `npx wrangler login` and sign in as the gym Gmail.
3. Check `https://www.hvpowerlifting.com`.

**Never run `wrangler pages deploy .` or `wrangler deploy` from the repo root.** `deploy.sh` copies
the site to a temporary folder first, so `.git`, the READMEs, `docs/` and `registration/` are never
published. Newer Wrangler versions hand `pages` commands off to Workers, which uses the current
folder as the site.

### 7.2 Add photos
Resize photos before adding them. Keep them under 25 MB (Cloudflare's per-file limit), and aim for
under 1 MB: `sips -Z 2000 -s formatOptions 72 photo.jpg`. Oversized photos are what took the site
down on Netlify.

### 7.3 Open event registration
1. Set `REGISTRATION_OPEN = true` in `event-sbd-foundations.html`. `REGISTRATION_ENDPOINT` is
   already set.
2. Run `./deploy.sh`, then submit one test registration and delete its row from the sheet.

Each session closes automatically 48 hours before it starts.

### 7.4 Registration form operations (Brandon or Doug)
- **Roster:** the Google Sheet "HVPL Event Registrations", one tab per event. Tick **Paid?** when
  the Venmo payment arrives.
- **If the form breaks,** the page tells registrants to text or email the gym, so nobody is lost.
  Errors appear in Apps Script → **Executions**.
- **Changing the script:** edit `registration/Code.gs`, paste it into Apps Script, then
  **Deploy → Manage deployments → Edit → New version**. That keeps the same URL. A *new
  deployment* would create a new URL that the site doesn't know about.
- **Limit:** about 100 emails a day from a consumer Gmail. Each registration sends 2 or 3.

### 7.5 Site down?
1. Check the Cloudflare status page and the dashboard (Pages → hvpowerlifting).
2. Check DNS: `dig +short www.hvpowerlifting.com` should return `hvpowerlifting.pages.dev`.
3. If one device can't load it but a phone on cellular can, it's a local cache. Try an incognito
   window or flush DNS.
4. If only the bare domain fails, ForwardDomain is the issue. The `www` address still works, so
   point people there.

---

## 8. Cutover log (October 10, 2026)

| Step | Result |
|---|---|
| Discovery (DNS, HTTP, repo) | Netlify suspended the site (`usage_exceeded`). Netlify Forms was the only Netlify dependency |
| Images resized (110 MB → 7.3 MB) | Same paths. Originals kept in git history |
| Canonicals, OG/Twitter, sitemap, robots, internal links → `https://www.hvpowerlifting.com` + clean paths | Done |
| Added `404.html`, `_headers`, `deploy.sh` | Done |
| Pages project `hvpowerlifting` created on the gym's Cloudflare account; deployed to `hvpowerlifting.pages.dev` | All pages 200; `.html` → 308; unknown → 404; `.git`/README not served |
| `www.hvpowerlifting.com` added as a custom domain | Certificate issued (Let's Encrypt) |
| Wix: `www` CNAME → `hvpowerlifting.pages.dev` | **Site back online** |
| Wix: apex A → `167.172.5.31` plus the `fwd` TXT record (ForwardDomain) | Bare domain redirects to `www`. Initially 302; TXT updated to `http-status=301`; confirmed 301 on Oct 12 |
| Registration → Apps Script + Sheet | Tested end to end on a preview deployment, then merged. Registration still **closed** (`REGISTRATION_OPEN = false`) |
| Search Console Domain property (TXT) verified; sitemap submitted | Done |
| Google Business Profile website → `https://www.hvpowerlifting.com/` | Done |
| Facebook / Instagram bio links | In progress |

---

## 9. Open items

| # | Item | Owner | When |
|---|---|---|---|
| 1 | ~~Confirm the bare domain returns **301** once ForwardDomain's cache expires~~ ✅ Confirmed 301 on Oct 12 | D | Done |
| 2 | Update the Facebook and Instagram bio links to `https://www.hvpowerlifting.com/` | B/D | Now |
| 3 | Watch Search Console → Pages/Indexing, using the **Domain** property. Old `.html` and apex URLs showing as "Page with redirect" is expected. The Oct 12 export of the `www` URL-prefix property (5 not indexed: 2× 404, 2× redirect, 1× duplicate canonical) was pre-migration data through Oct 8. Identify the two 404 URLs and add redirects if they're still linked anywhere. Click **Validate fix** about a week after the recrawl | D | Through ~Nov 7 |
| 4 | Delete the Netlify site (and remove its custom domain); cancel any Netlify plan/payment method; disconnect Netlify from the GitHub repo | D | ~Oct 24 |
| 5 | Confirm Wix domain **auto-renew is ON**, the card on file is valid, and both owners can log into Wix. Set a reminder 60 days before expiry | B | Soon |
| 6 | Give Brandon access to the Cloudflare account (Members → invite), or store the gym-Gmail login in a shared password manager | D | Soon |
| 7 | Move the repo to a business-owned GitHub org (e.g. `hudsonvalleypowerlifting`) | D | Optional |
| 8 | Turn on Cloudflare Web Analytics (free, no cookie banner needed) | D | Optional |
| 9 | **Transfer the domain from Wix to Cloudflare Registrar.** Cloudflare then runs the DNS and serves the bare domain directly, which removes ForwardDomain. Renewal is at cost (~$10–11/yr, probably cheaper than Wix). Takes up to ~5–7 days; unlock the domain and get the auth code from Wix first | D + B | Optional, later |

---

## 10. Ownership and access

| System | Account / owner | Notes |
|---|---|---|
| Cloudflare (Pages project `hvpowerlifting`) | hudsonvalleypowerlifting@gmail.com | Free plan. Add Brandon as a member (item 6) |
| Wix (domain registration + DNS) | Wix account | Auto-renew ON (item 5). Only Doug edits DNS |
| GitHub repo | `douglaswessel/hudsonvalleypowerlifting` | Consider a business org (item 7) |
| Google Sheet + Apps Script (registrations) | hudsonvalleypowerlifting@gmail.com | Script source of truth: `registration/Code.gs` |
| Google Search Console | Gym Gmail, **Domain** property `hvpowerlifting.com` | Verified by the apex TXT record |
| Google Business Profile | Brandon / gym Gmail | Website set to `https://www.hvpowerlifting.com/` |
| ForwardDomain.net | No account (DNS-only) | Free, no SLA; removed if item 9 is done |
| Netlify (old) | — | Delete per item 4 |

---

## 11. Cost

| Item | Before | After |
|---|---|---|
| Hosting | Netlify free plan (suspended for overuse) | **Cloudflare Pages free plan:** unlimited bandwidth and requests, 500 deploys/month, 25 MB max file size |
| Forms | Netlify Forms | Google Apps Script + Sheets: **$0** |
| Bare-domain redirect | n/a | ForwardDomain.net: **$0** |
| Domain | Wix renewal | Unchanged (Wix). Option 9 could lower it |
| **Total change** | | **$0/month.** The $20/month Vercel Pro cost in v1 was avoided |

---

## 12. Risks (remaining)

| Risk | Mitigation |
|---|---|
| ForwardDomain (free, no SLA) goes down, so the bare domain stops working | `www` keeps working, and GBP, Search Console, the sitemap and social links all use `www`. Long-term fix: item 9 |
| Oversized images get added again | Cloudflare bandwidth is unlimited, but the 25 MB file limit fails the deploy. Follow runbook 7.2 |
| Domain expires | Item 5 (auto-renew, valid card, calendar reminder) |
| Single person holds access | Items 6 and 7 |
| Apps Script email quota (~100/day) | Far above expected volume. If it's ever hit, registrations are still recorded in the sheet; only the emails fail |

---

## References

- Cloudflare Pages limits: https://developers.cloudflare.com/pages/platform/limits
- Cloudflare Pages custom domains: https://developers.cloudflare.com/pages/configuration/custom-domains/
- Cloudflare Pages redirects & headers: https://developers.cloudflare.com/pages/configuration/headers/
- ForwardDomain (DNS-based redirects): https://forwarddomain.net · https://github.com/willnode/forward-domain
- Wix: connecting a Wix domain to an external site: https://support.wix.com/en/article/connecting-a-wix-domain-to-an-external-site
- Google Apps Script web apps: https://developers.google.com/apps-script/guides/web
- Repo docs: `README.md` (hosting, DNS, events), `registration/README.md` (form setup)
