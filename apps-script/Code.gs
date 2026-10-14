/**
 * RSVP webhook for the wedding invite.
 * Bind this script to a Google Sheet (Extensions -> Apps Script), then deploy as a Web app
 * (Execute as: Me, Who has access: Anyone). See README section 5.
 */

const SHEET_NAME = 'RSVP';
// New columns go at the end so rows written by older versions stay aligned.
const HEADERS = ['Thời gian', 'Họ và tên', 'Tham dự', 'Số người đi cùng', 'Lời chúc', 'User agent', 'Khách nhà'];
const ATTEND_LABELS = { yes: 'Có', maybe: 'Có thể', no: 'Không' };
const MAX_GUESTS = 10;

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Honeypot: real guests never see or fill this field.
    if (data.website) return json({ ok: true });

    const name = clean(data.name, 100);
    if (!name) return json({ ok: false, error: 'missing_name' });

    const attend = ATTEND_LABELS[data.attend] ? data.attend : 'yes';
    const guests = attend === 'no' ? 0 : clampInt(data.guests, 0, MAX_GUESTS);

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      getSheet().appendRow([
        new Date(),
        name,
        ATTEND_LABELS[attend],
        guests,
        clean(data.message, 1000),
        clean(data.userAgent, 300),
        clean(data.side, 30),
      ]);
    } finally {
      lock.releaseLock();
    }

    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: 'server_error' });
  }
}

// Health check: open the Web app URL in a browser and you should see {"ok":true}.
function doGet() {
  return json({ ok: true });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0 || sheet.getLastColumn() < HEADERS.length) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Prefix with an apostrophe so guest input starting with = + - @ is stored as text, not run as a formula.
function clean(value, maxLength) {
  const text = String(value == null ? '' : value).trim().slice(0, maxLength);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function clampInt(value, min, max) {
  const n = parseInt(value, 10);
  if (isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
