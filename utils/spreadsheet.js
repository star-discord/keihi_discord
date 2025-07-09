// utils/spreadsheet.js
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive'];
const CREDENTIALS_PATH = path.join(__dirname, '../../credentials.json');
const TOKEN_PATH = path.join(__dirname, '../../token.json');

let sheetsClient = null;
let authClient = null; // Drive用にも使う

async function authorize() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
  oAuth2Client.setCredentials(token);

  authClient = oAuth2Client;
  sheetsClient = google.sheets({ version: 'v4', auth: oAuth2Client });
}

// ✅ スプレッドシートを作成し、必要なら Drive フォルダに移動
async function createSpreadsheet(title, headers = [], folderId = null) {
  const sheets = google.sheets({ version: 'v4', auth: authClient });

  const spreadsheet = await sheets.spreadsheets.create({
    resource: {
      properties: { title },
      sheets: [{
        properties: { title: '申請履歴' }
      }]
    },
    fields: 'spreadsheetId'
  });

  const spreadsheetId = spreadsheet.data.spreadsheetId;

  // ✅ ヘッダーを書き込み
  if (headers.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: '申請履歴!A1',
      valueInputOption: 'RAW',
      resource: { values: [headers] }
    });
  }

  // ✅ Google Drive フォルダに追加
  if (folderId) {
    const drive = google.drive({ version: 'v3', auth: authClient });

    await drive.files.update({
      fileId: spreadsheetId,
      addParents: folderId,
      fields: 'id, parents'
    });

    console.log(`📂 スプレッドシートを Drive フォルダに追加: ${folderId}`);
  }

  return spreadsheetId;
}

// ✅ データを追加（1行）
async function appendEntry(spreadsheetId, entry) {
  const values = [[
    entry.username,
    entry.timestamp || '',
    entry.item,
    entry.amount,
    entry.detail,
    entry.approvalStatus
  ]];

  await sheetsClient.spreadsheets.values.append({
    spreadsheetId,
    range: '申請履歴!A1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: { values }
  });
}

async function initSheets() {
  if (!sheetsClient || !authClient) await authorize();
}

module.exports = {
  initSheets,
  createSpreadsheet,
  appendEntry
};
