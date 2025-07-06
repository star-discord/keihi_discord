// utils/spreadsheet.js

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config();

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function createSpreadsheetForGuild(guildId, yearMonth) {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: SCOPES
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const title = `経費申請ログ_${guildId}_${yearMonth}`;

  const res = await sheets.spreadsheets.create({
    resource: {
      properties: { title }
    }
  });

  const spreadsheetId = res.data.spreadsheetId;

  const dir = path.join('data', guildId);
  const mapPath = path.join(dir, 'spreadsheet_map.json');

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let existing = {};
  if (fs.existsSync(mapPath)) {
    existing = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  }

  existing[yearMonth] = spreadsheetId;
  fs.writeFileSync(mapPath, JSON.stringify(existing, null, 2));

  console.log(`✅ スプレッドシート作成成功: ${title}`);
  return spreadsheetId;
}

function getSpreadsheetIdForGuild(guildId, yearMonth) {
  const mapPath = path.join('data', guildId, 'spreadsheet_map.json');
  if (!fs.existsSync(mapPath)) return null;
  const data = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  return data[yearMonth] || null;
}

async function writeExpensesToSpreadsheet(guildId, yearMonth, entries) {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: SCOPES
  });
  const sheets = google.sheets({ version: 'v4', auth });

  let spreadsheetId = getSpreadsheetIdForGuild(guildId, yearMonth);
  if (!spreadsheetId) {
    spreadsheetId = await createSpreadsheetForGuild(guildId, yearMonth);
  }

  const header = ['日時', '申請者', '項目', '金額', '備考', '承認済ユーザー'];
  const values = [header];

  for (const e of entries) {
    const date = new Date(e.timestamp).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    const approvers = Array.isArray(e.approvedBy)
      ? e.approvedBy.map(u => u.username || u.userId).join(', ')
      : '';
    values.push([
      date,
      e.username || e.userId,
      e.expenseItem,
      e.amount,
      e.notes,
      approvers
    ]);
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'A1',
    valueInputOption: 'RAW',
    resource: {
      values
    }
  });

  console.log(`✅ スプレッドシートへ書き込み完了: ${spreadsheetId}`);
  return spreadsheetId;
}

module.exports = {
  createSpreadsheetForGuild,
  getSpreadsheetIdForGuild,
  writeExpensesToSpreadsheet
};
