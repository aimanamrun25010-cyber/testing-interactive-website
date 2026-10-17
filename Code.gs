/**
 * GOOGLE SHEETS BACKEND FOR "UNTUK CINTA HATI SAYA"
 *
 * Setup: create a Google Sheet → Extensions → Apps Script → paste this
 * file → deploy as Web app: Execute as "Me", access "Anyone".
 * Copy the /exec URL into script.js (CONFIG.sheetsWebAppUrl).
 *
 * One completed website visit = one row in the "Responses" tab.
 * The spreadsheet owner can download: File → Download → Microsoft Excel (.xlsx)
 */
const SHEET_NAME = 'Responses';
const HEADERS = [
  'Recorded At (Server)',
  'Session ID',
  'Started At (Visitor)',
  'Submitted At (Visitor)',
  'Visitor Time Zone',
  'Dinner Accepted',
  'Meal Choice',
  'Clothing Choice',
  'Clothing Color',
  'Love Reply',
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const session = safeCell(data.sessionId, 90);
    const meal = safeCell(data.mealChoice, 70);
    const color = safeCell(data.clothingColor, 70);
    if (!session || !meal || !color) {
      return jsonResponse({ ok: false, error: 'Missing essential choice fields' });
    }

    const book = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, HEADERS.length)
        .setBackground('#5B3268').setFontColor('#FFFFFF').setFontWeight('bold');
    }

    // Prevent accidentally recording the same browser session twice.
    if (sheet.getLastRow() > 1) {
      const found = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1)
        .createTextFinder(session).matchEntireCell(true).findNext();
      if (found) return jsonResponse({ ok: true, duplicate: true });
    }

    sheet.appendRow([
      new Date(),
      session,
      safeCell(data.startedAt, 60),
      safeCell(data.submittedAt, 60),
      safeCell(data.timeZone, 80),
      safeCell(data.dinnerAccepted, 20),
      meal,
      safeCell(data.clothingChoice, 60),
      color,
      safeCell(data.loveReply, 90),
    ]);
    return jsonResponse({ ok: true });
  } catch (err) {
    console.error(err);
    return jsonResponse({ ok: false, error: String(err.message || err) });
  } finally {
    try { lock.releaseLock(); } catch (_) { /* Lock not acquired */ }
  }
}

function safeCell(value, maxLength) {
  let str = String(value == null ? '' : value).trim().slice(0, maxLength);
  // Prevent formula injection in Google Sheets / exported Excel.
  if (/^[=+\-@]/.test(str)) str = "'" + str;
  return str;
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService.createTextOutput('Date-night response collector is running. 💗');
}
