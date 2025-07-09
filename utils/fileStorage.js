// utils/fileStorage.js
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { getDataPath } = require('./pathUtils.js');
const { createAndSaveSpreadsheet } = require('./spreadsheetUtils.js'); // ← 新しく追加

// ────────── 内部ユーティリティ ──────────
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function safeReadJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error(`❌ JSON読み込み失敗: ${filePath}:`, err);
    return fallback;
  }
}

function saveJson(filePath, data) {
  ensureDirExists(path.dirname(filePath));
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`❌ JSON保存失敗: ${filePath}:`, err);
  }
}

// ────────── 経費ログ処理 ──────────

/**
 * 経費ログを追加保存します。
 * @param {string} guildId 
 * @param {object} entry 
 */
function appendExpenseLog(guildId, entry) {
  const logDir = getDataPath(guildId, 'logs');
  const logFile = path.join(logDir, `${getMonth()}.json`);
  ensureDirExists(logDir);

  const logs = safeReadJson(logFile, []);
  logs.push(entry);
  saveJson(logFile, logs);
}

/**
 * 経費ログを取得します。
 * @param {string} guildId 
 * @param {string} yearMonth 
 * @param {string|null} userId 
 * @returns {Array}
 */
function getExpenseEntries(guildId, yearMonth, userId = null) {
  const logFile = getDataPath(guildId, 'logs', `${yearMonth}.json`);
  const list = safeReadJson(logFile, []);
  return userId ? list.filter(e => e.userId === userId) : list;
}

/**
 * 最初のスレッド/スプレッドシート付きエントリを取得
 */
function getFirstEntryWithLinks(guildId, yearMonth, userId) {
  const entries = getExpenseEntries(guildId, yearMonth, userId);
  return entries.find(e => e.threadMessageId || e.spreadsheetUrl) || null;
}

// ────────── スプレッドシート関連 ──────────

/**
 * 指定年月のスプレッドシートURLを取得（1件目）
 */
function getSpreadsheetUrl(guildId, yearMonth) {
  const logFile = getDataPath(guildId, 'logs', `${yearMonth}.json`);
  const entries = safeReadJson(logFile, []);
  const entry = entries.find(e => e.spreadsheetUrl);
  return entry?.spreadsheetUrl || null;
}

/**
 * URLがなければ自動生成して保存し、URLを返す
 */
async function getOrCreateSpreadsheetUrl(guildId, yearMonth) {
  const existing = getSpreadsheetUrl(guildId, yearMonth);
  if (existing) return existing;

  const logFile = getDataPath(guildId, 'logs', `${yearMonth}.json`);
  const entries = safeReadJson(logFile, []);

  if (!entries.length) return null;

  const newUrl = await createAndSaveSpreadsheet(guildId, yearMonth, entries);

  for (const entry of entries) {
    entry.spreadsheetUrl = newUrl;
  }

  saveJson(logFile, entries);
  return newUrl;
}

// ────────── エクスポート ──────────

module.exports = {
  appendExpenseLog,
  getExpenseEntries,
  getFirstEntryWithLinks,
  getSpreadsheetUrl,
  getOrCreateSpreadsheetUrl
};

