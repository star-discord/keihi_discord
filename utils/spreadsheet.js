const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config();

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const getSheetAuth = () => new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: SCOPES
});

function getSpreadsheetMapPath(guildId) {
  return path.join('data', guildId, 'spreadsheet_map.json');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readSpreadsheetMap(guildId) {
  const mapPath = getSpreadsheetMapPath(guildId);
  if (!fs.existsSync(mapPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  } catch (err) {
    console.error(`❌ マップファイル読込失敗 (${mapPath}):`, err);
    return {};
  }
}

function writeSpreadsheetMap(guildId, map) {
  const mapPath = getSpreadsheetMapPath(guildId);
  try {
    ensureDir(path.dirname(mapPath));
    fs.writeFileSync(mapPath, JSON.stringify(map, null, 2));
  } catch (err) {
    console.error(`❌ マップファイル保存失敗 (${mapPath}):`, err);
  }
}

async function createSpreadsheetForGuild(guildId, yearMonth) {
  const auth = getSheetAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const title = `経費申請ログ_${guildId}_${yearMonth}`;

  try {
    const res = await sheets.spreadsheets.create({
      resource: { properties: { title } }
    });

    const spreadsheetId = res.data.spreadsheetId;

    const map = readSpreadsheetMap(guildId);
    map[yearMonth] = spreadsheetId;
    writeSpreadsheetMap(guildId, map);

    console.log(`✅ スプレッドシート作成成功: ${title}`);
    return spreadsheetId;
  } catch (err) {
    console.error(`❌ スプレッドシート作成失敗:`, err);
    throw err;
  }
}

function getSpreadsheetIdForGuild(guildId, yearMonth) {
  const map = readSpreadsheetMap(guildId);
  return map[yearMonth] || null;
}

async function writeExpensesToSpreadsheet(guildId, yearMonth, entries) {
  const auth = getSheetAuth();
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

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'A1',
      valueInputOption: 'RAW',
      resource: { values }
    });

    console.log(`✅ スプレッドシートへ書き込み完了: ${spreadsheetId}`);
    return spreadsheetId;
  } catch (err) {
    console.error(`❌ スプレッドシート書き込み失敗:`, err);
    throw err;
  }
}

module.exports = {
  createSpreadsheetForGuild,
  getSpreadsheetIdForGuild,
  writeExpensesToSpreadsheet
};
