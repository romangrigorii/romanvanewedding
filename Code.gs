/**
 * Roman & Vane Wedding — RSVP to Google Sheet
 *
 * 1. Open your Google Sheet:
 *    https://docs.google.com/spreadsheets/d/1-TJeJ8hccvMClkLwL0KELyRtEE5j9Ht6df7hc5Bg_js/edit
 * 2. Extensions → Apps Script. Delete any sample code and paste this entire file.
 * 3. Save (Ctrl+S). Run once doPost (or any function) and authorize the app.
 * 4. Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web app URL and put it in main.js as RSVP_SCRIPT_URL.
 */

var SPREADSHEET_ID = "1-TJeJ8hccvMClkLwL0KELyRtEE5j9Ht6df7hc5Bg_js";
var SHEET_GID = 785370606; // tab id from the sheet URL #gid=785370606
var VALID_RSVP_CODE = "12341234"; // only this code is accepted for now

function doPost(e) {
  try {
    var body = e.postData && e.postData.contents ? e.postData.contents : "{}";
    var data = JSON.parse(body);
    var code = (data.code || "").toString().replace(/\D/g, "").slice(0, 8);
    var names = Array.isArray(data.names) ? data.names : [];

    if (code !== VALID_RSVP_CODE) {
      return response(400, { ok: false, error: "Invalid invite code" });
    }
    if (names.length === 0) {
      return response(400, { ok: false, error: "No names" });
    }

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheets = ss.getSheets();
    var sheet = null;
    for (var i = 0; i < sheets.length; i++) {
      if (sheets[i].getSheetId() === SHEET_GID) {
        sheet = sheets[i];
        break;
      }
    }
    if (!sheet) sheet = sheets[0];

    for (var n = 0; n < names.length; n++) {
      var name = (names[n] || "").toString().trim();
      if (name) {
        sheet.appendRow([name, code]);
      }
    }

    return response(200, { ok: true });
  } catch (err) {
    return response(500, { ok: false, error: err.toString() });
  }
}

function doGet() {
  return ContentService.createTextOutput("RSVP endpoint. Send POST with JSON: { code: \"8digits\", names: [\"Guest 1\", \"Guest 2\"] }")
    .setMimeType(ContentService.MimeType.TEXT);
}

function response(statusCode, obj) {
  var output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
