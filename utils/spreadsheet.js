const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config();

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const BASE_DIR = process.env.BASE_DIR || path.join(__dirname, '..', 'data', 'keihi');

// ────────── 認証 ──────────
function getSheetAuth() {
  return new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: SCOPES
  });
}

// ────────── パスユーティリティ ──────────
function getGuildDir(guildId) {
  return path.join(BASE_DIR, guildId);
}

function getSpreadsheetMapPath(guildId) {
  return path.join(getGuildDir(guildId), 'spreadsheet_map.json');
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// ────────── マップ読み書き ──────────
function readSpreadsheetMap(guildId) {
  const filePath = getSpreadsheetMapPath(guildId);
  try {
    if (!fs.existsSync(filePath)) return {};
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`❌ スプレッドマップ読み込み失敗 (${filePath}):`, err);
    return {};
  }
}

function writeSpreadsheetMap(guildId, map) {
  const filePath = getSpreadsheetMapPath(guildId);
  try {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(map, null, 2), 'utf8');
  } catch (err) {
    console.error(`❌ スプレッドマップ保存失敗 (${filePath}):`, err);
  }
}

// ────────── スプレッドシート作成 ──────────
async function createSpreadsheetForGuild(guildId, yearMonth) {
  const auth = getSheetAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  const title = `経費申請ログ_${guildId}_${yearMonth}`;

  try {
    const res = await sheets.spreadsheets.create({
      resource: {
        properties: { title }
      }
    });

    const spreadsheetId = res.data.spreadsheetId;
    const map = readSpreadsheetMap(guildId);
    map[yearMonth] = spreadsheetId;
    writeSpreadsheetMap(guildId, map);

    console.log(`✅ スプレッドシート作成: ${title}`);
    return spreadsheetId;
  } catch (err) {
    console.error('❌ スプレッドシート作成エラー:', err);
    throw err;
  }
}

function getSpreadsheetIdForGuild(guildId, yearMonth) {
  const map = readSpreadsheetMap(guildId);
  return map[yearMonth] || null;
}

// ────────── 経費データ書き込み ──────────
async function writeExpensesToSpreadsheet(guildId, yearMonth, entries) {
  const auth = getSheetAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  let spreadsheetId = getSpreadsheetIdForGuild(guildId, yearMonth);
  if (!spreadsheetId) {
    spreadsheetId = await createSpreadsheetForGuild(guildId, yearMonth);
  }

  const header = ['日時', '申請者', '項目', '金額', '備考', '承認者'];
  const values = [header];

  for (const e of entries) {
    const date = new Date(e.timestamp).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    const approvers = Array.isArray(e.approvedBy)
      ? e.approvedBy.map(u => u.username || u.userId).join(', ')
      : '';
    values.push([
      date,
      e.userName || e.userId,
      e.item || '',
      e.amount || '',
      e.detail || '',
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

    console.log(`✅ 経費データ書き込み完了: ${spreadsheetId}`);
    return spreadsheetId;
  } catch (err) {
    console.error('❌ スプレッドシート書き込みエラー:', err);
    throw err;
  }
}

// ────────── Exports ──────────
module.exports = {
  createSpreadsheetForGuild,
  getSpreadsheetIdForGuild,
  writeExpensesToSpreadsheet
};
