// utils/spreadsheet.js

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const dayjs = require('dayjs');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const CREDENTIALS_PATH = path.join(__dirname, '../../credentials.json');
const TOKEN_PATH = path.join(__dirname, '../../token.json');

let sheetsClient = null;

async function authorize() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
  oAuth2Client.setCredentials(token);

  sheetsClient = google.sheets({ version: 'v4', auth: oAuth2Client });
}

// SpreadSheet を作成してIDを返す
async function createSpreadsheet(title) {
  const res = await sheetsClient.spreadsheets.create({
    resource: {
      properties: {
        title
      },
      sheets: [{
        properties: {
          title: '申請履歴',
        }
      }]
    },
    fields: 'spreadsheetId'
  });

  return res.data.spreadsheetId;
}

// データを書き込む
async function appendEntry(spreadsheetId, entry) {
  const values = [[
    entry.username,
    `\u00a5${entry.amount.toLocaleString()}`,
    entry.item,
    entry.detail,
    entry.timestamp,
    entry.messageId,
    entry.approvalStatus
  ]];

  await sheetsClient.spreadsheets.values.append({
    spreadsheetId,
    range: '申請履歴!A1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      values
    }
  });
}

// 初期化
async function initSheets() {
  if (!sheetsClient) await authorize();
}

module.exports = {
  initSheets,
  createSpreadsheet,
  appendEntry
};// utils/spreadsheet.js

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const dayjs = require('dayjs');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const CREDENTIALS_PATH = path.join(__dirname, '../../credentials.json');
const TOKEN_PATH = path.join(__dirname, '../../token.json');

let sheetsClient = null;

async function authorize() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
  oAuth2Client.setCredentials(token);

  sheetsClient = google.sheets({ version: 'v4', auth: oAuth2Client });
}

// SpreadSheet を作成してIDを返す
async function createSpreadsheet(title) {
  const res = await sheetsClient.spreadsheets.create({
    resource: {
      properties: {
        title
      },
      sheets: [{
        properties: {
          title: '申請履歴',
        }
      }]
    },
    fields: 'spreadsheetId'
  });

  return res.data.spreadsheetId;
}

// データを書き込む
async function appendEntry(spreadsheetId, entry) {
  const values = [[
    entry.username,
    `\u00a5${entry.amount.toLocaleString()}`,
    entry.item,
    entry.detail,
    entry.timestamp,
    entry.messageId,
    entry.approvalStatus
  ]];

  await sheetsClient.spreadsheets.values.append({
    spreadsheetId,
    range: '申請履歴!A1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      values
    }
  });
}

// 初期化
async function initSheets() {
  if (!sheetsClient) await authorize();
}

module.exports = {
  initSheets,
  createSpreadsheet,
  appendEntry
};