const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS;

let sheetsClient = null;

async function authorize() {
  if (sheetsClient) return sheetsClient;

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });

  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

async function appendRowToSheet(yearMonth, rowData) {
  const sheets = await authorize();

  const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const exists = sheetMeta.data.sheets.some(s => s.properties.title === yearMonth);

  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{ addSheet: { properties: { title: yearMonth } } }],
      },
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${yearMonth}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['日時', 'ユーザー名', '経費項目', '金額', '備考']],
      },
    });
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${yearMonth}!A2`,
    valueInputOption: 'RAW',
    requestBody: { values: [rowData] },
  });

  console.log(`✅ シート「${yearMonth}」にデータ追加完了`);
}

module.exports = {
  appendRowToSheet,
};
