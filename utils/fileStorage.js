const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ────────── ベースディレクトリ ──────────
const BASE_DIR = path.resolve(process.env.BASE_DIR || './data/keihi');

function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// ────────── パス取得ユーティリティ ──────────
function getGuildDir(guildId) {
  return path.join(BASE_DIR, guildId);
}

function getConfigPath(guildId) {
  return path.join(getGuildDir(guildId), 'config.json');
}

function getLogPath(guildId, yearMonth) {
  return path.join(getGuildDir(guildId), 'logs', `${yearMonth}.json`);
}

// ────────── JSON 読み書き ──────────
function safeReadJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);

    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    if (typeof fallback === 'object' && !Array.isArray(fallback) && typeof parsed !== 'object') return fallback;

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

// ────────── 設定データ管理（config.json）──────────
const configCache = new Map();

function loadGuildData(guildId) {
  if (configCache.has(guildId)) return configCache.get(guildId);
  const config = safeReadJson(getConfigPath(guildId), {});
  configCache.set(guildId, config);
  return config;
}

function saveGuildData(guildId, data) {
  configCache.set(guildId, data);
  saveJson(getConfigPath(guildId), data);
}

function getApproverRoles(guildId) {
  const config = loadGuildData(guildId);
  return config.approverRoles || [];
}

function setApproverRoles(guildId, roles) {
  const config = loadGuildData(guildId);
  config.approverRoles = roles;
  saveGuildData(guildId, config);
}

// ────────── 経費エントリの構造バリデーション ──────────
function isValidExpenseEntry(entry) {
  return (
    typeof entry.userId === 'string' &&
    typeof entry.userName === 'string' &&
    typeof entry.item === 'string' &&
    typeof entry.amount === 'number' &&
    typeof entry.detail === 'string' &&
    typeof entry.timestamp === 'string' &&
    typeof entry.threadMessageId === 'string' &&
    Array.isArray(entry.approvedBy)
  );
}

// ────────── 経費ログ処理 ──────────
function appendExpenseLog(guildId, yearMonth, entry) {
  if (!isValidExpenseEntry(entry)) {
    console.warn('⚠️ 無効なログエントリが検出されました:', entry);
    return;
  }
  const filePath = getLogPath(guildId, yearMonth);
  const list = safeReadJson(filePath, []);
  list.push(entry);
  saveJson(filePath, list);
}

function getExpenseEntries(guildId, yearMonth, userId = null) {
  const list = safeReadJson(getLogPath(guildId, yearMonth), []);
  return userId ? list.filter(e => e.userId === userId) : list;
}

function getUserExpenseEntries(guildId, yearMonth, userId) {
  return getExpenseEntries(guildId, yearMonth, userId);
}

function updateApprovalStatus(guildId, yearMonth, threadMessageId, userId, username) {
  const logPath = getLogPath(guildId, yearMonth);
  const entries = safeReadJson(logPath, []);
  const entry = entries.find(e => e.threadMessageId === threadMessageId);
  if (!entry) return null;

  if (!entry.approvedBy) entry.approvedBy = [];

  const already = entry.approvedBy.find(a => a.userId === userId);
  if (!already) {
    entry.approvedBy.push({ userId, username });
    saveJson(logPath, entries);
  }

  return entry.approvedBy;
}

function deleteExpenseEntry(guildId, yearMonth, messageId) {
  const logPath = getLogPath(guildId, yearMonth);
  const entries = safeReadJson(logPath, []);
  const filtered = entries.filter(e => e.threadMessageId !== messageId);
  if (filtered.length !== entries.length) {
    saveJson(logPath, filtered);
    return true;
  }
  return false;
}

function editExpenseEntry(guildId, yearMonth, messageId, newData) {
  const logPath = getLogPath(guildId, yearMonth);
  const entries = safeReadJson(logPath, []);
  const entry = entries.find(e => e.threadMessageId === messageId);
  if (!entry) return false;

  Object.assign(entry, newData);
  saveJson(logPath, entries);
  return true;
}

function getAvailableExpenseFiles(guildId) {
  const logDir = path.join(getGuildDir(guildId), 'logs');
  try {
    if (!fs.existsSync(logDir)) return [];
    return fs.readdirSync(logDir)
      .filter(f => /^\d{4}-\d{2}\.json$/.test(f))
      .map(f => f.replace('.json', ''));
  } catch (err) {
    console.error(`❌ ログファイル一覧取得失敗: ${guildId}:`, err);
    return [];
  }
}

// ────────── Export ──────────
module.exports = {
  // 設定
  loadGuildData,
  saveGuildData,
  getApproverRoles,
  setApproverRoles,

  // 経費ログ
  appendExpenseLog,
  getExpenseEntries,
  getUserExpenseEntries,
  updateApprovalStatus,
  deleteExpenseEntry,
  editExpenseEntry,
  getAvailableExpenseFiles
};
