# Event registrations (Google Sheet + Apps Script)

Event registration forms on the site post to a Google Apps Script web app. The script lives in a
Google Sheet owned by **hudsonvalleypowerlifting@gmail.com**. For each registration it:

1. adds a row to the sheet, with a tab per event (`sbd-foundations`, …) and a **Paid?** checkbox
2. emails the gym (subject: `New registration: <name> — <event> ($amount)`)
3. emails the registrant their sessions, the amount due, and a **Pay with Venmo** button, and CCs the
   parent/guardian for under-18s

Emails are sent from the gym Gmail, and replies go to the gym Gmail. The amount is recalculated
in the script from the number of sessions picked, so editing the page can't change it.

`Code.gs` in this folder is the source of truth. The copy in Apps Script must match it.

## One-time setup (about 5 minutes, signed in as the gym Gmail)

1. Go to [sheets.new](https://sheets.new) and name the sheet **HVPL Event Registrations**.
2. **Extensions → Apps Script**. Delete everything in `Code.gs`, paste in this folder's `Code.gs`,
   and click **Save**.
3. In the function dropdown at the top, pick **`authorize`** and click **Run**. Approve the
   permissions: *See, edit… spreadsheets* and *Send email as you*. Google shows an "unverified app"
   warning because this is your own script; click **Advanced → Go to (project) (unsafe)**.
4. **Deploy → New deployment** → gear icon → **Web app**.
   - Description: `registrations`
   - Execute as: **Me (hudsonvalleypowerlifting@gmail.com)**
   - Who has access: **Anyone**

   Click **Deploy** and copy the **Web app URL** (it ends in `/exec`).
5. Paste that URL into `REGISTRATION_ENDPOINT` near the bottom of `event-sbd-foundations.html`.

To check it's up, open the URL in a browser. It should show `{"ok":true,"service":"hvpl-registrations"}`.

## Changing the script later

Edit `Code.gs` here, paste it into Apps Script, then **Deploy → Manage deployments → (pencil) →
Version: New version → Deploy**. This keeps the same URL. **Deploy → New deployment** would create a
new URL that the site doesn't know about.

## Adding an event

1. Give the new event page's form a new `form-name` value (e.g. `sbd-advanced`) and set the same
   `REGISTRATION_ENDPOINT`.
2. Add a matching entry to `EVENTS` in `Code.gs` (title, prices by session count, Venmo username,
   note), then redeploy a new version as above. The sheet tab is created on the first registration.
   Without an `EVENTS` entry, registrations are still recorded and the gym is notified, but no
   confirmation email goes out.

## Limits

- Consumer Gmail accounts can send about 100 emails a day from Apps Script. Each registration uses
  two (gym + registrant), or three with a guardian CC.
- If the script errors, the page tells the registrant to text or email the gym, so nobody is lost.
  Errors appear in Apps Script under **Executions**.
