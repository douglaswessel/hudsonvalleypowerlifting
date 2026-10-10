/**
 * HVPL event registrations -> Google Sheet + emails.
 *
 * Lives in the "HVPL Event Registrations" Google Sheet owned by
 * hudsonvalleypowerlifting@gmail.com (Extensions > Apps Script) and is
 * deployed as a Web app (Execute as: Me, Who has access: Anyone).
 * Setup and redeploy steps: registration/README.md.
 *
 * Each event form posts here with a hidden `form-name` field. Every form
 * gets its own tab, named after `form-name`. Columns are created from the
 * field names the first time they appear, so new fields need no script change.
 */

const GYM_EMAIL = 'hudsonvalleypowerlifting@gmail.com';
const GYM_PHONE = '(855) 596-3810';
const GYM_SMS = 'sms:+18555963810';

/* Per-event settings, keyed by the form's `form-name` value. Prices are
   recomputed here from the number of sessions picked, so the amount in
   the confirmation email can't be changed by editing the page. */
const EVENTS = {
  'sbd-foundations': {
    title: 'SBD Foundations: Squat, Bench & Deadlift',
    prices: { 1: 50, 2: 100, 3: 125 },
    venmoUsername: 'Heather-Monkey',
    venmoNote: 'SBD Foundations'
  }
};

/* Fields that never go in the sheet. */
const SKIP_FIELDS = ['form-name', 'bot-field'];

function doPost(e) {
  const params = (e && e.parameters) || {};
  const formName = first(params['form-name']) || 'registrations';

  // Honeypot filled in: pretend success so bots don't retry, store nothing.
  if (first(params['bot-field'])) {
    return json({ ok: true });
  }

  try {
    const event = EVENTS[formName] || null;
    const sessions = params['sessions'] || [];
    const amount = event ? (event.prices[sessions.length] || 0) : null;

    const record = {};
    record['Received'] = new Date();
    Object.keys(params).forEach(key => {
      if (SKIP_FIELDS.indexOf(key) !== -1) return;
      record[key] = params[key].map(v => String(v).slice(0, 2000)).join('\n');
    });
    if (amount !== null) record['amount-due'] = '$' + amount;

    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      appendRecord(formName, record);
    } finally {
      lock.releaseLock();
    }

    notifyGym(formName, event, record);
    if (event) confirmToRegistrant(event, record, sessions, amount);

    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: 'server_error' });
  }
}

/* Health check: opening the web app URL in a browser shows this. */
function doGet() {
  return json({ ok: true, service: 'hvpl-registrations' });
}

/* ---------------- Sheet ---------------- */

function appendRecord(formName, record) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(formName);
  if (!sheet) {
    sheet = ss.insertSheet(formName);
    sheet.appendRow(['Paid?', 'Received']);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 2).setFontWeight('bold');
  }

  // Add a column for any field we haven't seen before.
  let header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  Object.keys(record).forEach(key => {
    if (header.indexOf(key) === -1) {
      sheet.getRange(1, header.length + 1).setValue(key).setFontWeight('bold');
      header.push(key);
    }
  });

  const row = header.map(col => {
    if (col === 'Paid?') return false;
    const value = record[col];
    if (value === undefined) return '';
    return value instanceof Date ? value : safeCell(value);
  });
  sheet.appendRow(row);
  sheet.getRange(sheet.getLastRow(), 1).insertCheckboxes();
}

/* Stop values like "+1 845..." or "=HYPERLINK(...)" being read as formulas. */
function safeCell(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

/* ---------------- Email ---------------- */

function notifyGym(formName, event, record) {
  const name = fullName(record);
  const title = event ? event.title : formName;
  const lines = Object.keys(record)
    .filter(k => k !== 'Received')
    .map(k => '<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top">' + esc(k) +
      '</td><td style="padding:4px 0">' + esc(record[k]).replace(/\n/g, '<br>') + '</td></tr>');

  MailApp.sendEmail({
    to: GYM_EMAIL,
    replyTo: record['email'] || GYM_EMAIL,
    subject: 'New registration: ' + name + ' — ' + title + (record['amount-due'] ? ' (' + record['amount-due'] + ')' : ''),
    htmlBody: '<p><strong>' + esc(name) + '</strong> registered for <strong>' + esc(title) + '</strong>.</p>' +
      '<table style="border-collapse:collapse;font-size:14px">' + lines.join('') + '</table>' +
      '<p style="color:#666">Tick "Paid?" in the sheet once their Venmo comes in. ' +
      '<a href="' + SpreadsheetApp.getActiveSpreadsheet().getUrl() + '">Open the sheet</a></p>'
  });
}

function confirmToRegistrant(event, record, sessions, amount) {
  const to = record['email'];
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return;

  const name = fullName(record);
  const note = event.venmoNote + ' — ' + name;
  const venmo = 'https://venmo.com/?txn=pay&recipients=' + encodeURIComponent(event.venmoUsername) +
    '&amount=' + amount + '&note=' + encodeURIComponent(note);
  const sessionItems = sessions.map(s => '<li>' + esc(s) + '</li>').join('');

  const message = {
    to: to,
    replyTo: GYM_EMAIL,
    name: 'Hudson Valley Powerlifting',
    subject: "You're registered: " + event.title,
    htmlBody:
      '<div style="font-family:-apple-system,system-ui,sans-serif;font-size:15px;line-height:1.5;color:#111;max-width:560px">' +
      '<p>Hi ' + esc(record['first-name'] || name) + ',</p>' +
      '<p>Thanks for signing up for <strong>' + esc(event.title) + '</strong>. Here\'s what you picked:</p>' +
      '<ul>' + sessionItems + '</ul>' +
      '<p><strong>Amount due: $' + amount + '</strong></p>' +
      '<p>Your spot is held once payment comes in. Pay by Venmo to <strong>@' + esc(event.venmoUsername) +
      '</strong> with the note "' + esc(note) + '":</p>' +
      '<p><a href="' + venmo + '" style="display:inline-block;background:#dc2626;color:#fff;padding:12px 22px;' +
      'border-radius:6px;text-decoration:none;font-weight:600">Pay $' + amount + ' with Venmo</a></p>' +
      '<p style="color:#555;font-size:13px">If the button doesn\'t open Venmo, send $' + amount +
      ' to @' + esc(event.venmoUsername) + ' in the Venmo app.</p>' +
      '<p>Questions or need to change sessions? Reply to this email or text us at ' +
      '<a href="' + GYM_SMS + '">' + GYM_PHONE + '</a>.</p>' +
      '<p>See you at the gym,<br>Hudson Valley Powerlifting<br>155 Vineyard Ave, Highland, NY</p>' +
      '</div>'
  };

  // Under-18 registrations: copy the parent/guardian.
  const guardian = record['guardian-email'];
  if (guardian && guardian !== to) message.cc = guardian;

  MailApp.sendEmail(message);
}

/* ---------------- Helpers ---------------- */

function first(values) {
  return values && values.length ? String(values[0]) : '';
}

function fullName(record) {
  return ((record['first-name'] || '') + ' ' + (record['last-name'] || '')).trim() || 'Someone';
}

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* Run once from the editor (select it, click Run) to grant permissions
   before deploying. Sends nothing. */
function authorize() {
  SpreadsheetApp.getActiveSpreadsheet().getName();
  MailApp.getRemainingDailyQuota();
}
