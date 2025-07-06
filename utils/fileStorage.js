const fs = require('fs');
const path = require('path');

// ────────── ベースディレクトリ ──────────
const BASE_DIR = path.join(__dirname, '..', 'data', 'keihi');

function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// ────────── パス取得 ──────────
function getGuildDir(guildId) {
  return path.join(BASE_DIR, guildId);
}

function getConfigPath(guildId) {
  return path.join(getGuildDir(guildId), 'config.json');
}

function getLogPath(guildId, yearMonth) {
  return path.join(getGuildDir(guildId), 'logs', `${yearMonth}.json`);
}

// ────────── JSON読み書き ──────────
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

// ────────── ギルド設定 ──────────
function loadGuildData(guildId) {
  return safeReadJson(getConfigPath(guildId), {});
}

function saveGuildData(guildId, data) {
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

// ────────── 経費ログ ──────────
function appendExpenseLog(guildId, yearMonth, entry) {
  const path = getLogPath(guildId, yearMonth);
  const list = safeReadJson(path, []);
  list.push(entry);
  saveJson(path, list);
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

  // ログ処理
  appendExpenseLog,
  getExpenseEntries,
  getUserExpenseEntries,
  updateApprovalStatus,
  deleteExpenseEntry,
  editExpenseEntry,
  getAvailableExpenseFiles
};

