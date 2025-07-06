// ✅ utils/fileStorage.js（ローカル保存＋承認対応・ユーザー名対応）

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..', 'data');

function getGuildDir(guildId) {
  return path.join(BASE_DIR, guildId);
}

function getGuildFilePath(guildId) {
  return path.join(getGuildDir(guildId), `${guildId}.json`);
}

function getExpenseLogPath(guildId, yearMonth) {
  return path.join(getGuildDir(guildId), `${yearMonth}.json`);
}

function loadGuildData(guildId) {
  const filePath = getGuildFilePath(guildId);
  try {
    if (!fs.existsSync(getGuildDir(guildId))) {
      fs.mkdirSync(getGuildDir(guildId), { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
      return {};
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`❌ ギルド設定読み込みエラー (${guildId}):`, err);
    return {};
  }
}

function saveGuildData(guildId, data) {
  const filePath = getGuildFilePath(guildId);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`❌ ギルド設定保存エラー (${guildId}):`, err);
  }
}

function getApproverRoles(guildId) {
  const data = loadGuildData(guildId);
  return data.approverRoles || [];
}

function setApproverRoles(guildId, roles) {
  const data = loadGuildData(guildId);
  data.approverRoles = roles;
  saveGuildData(guildId, data);
}

function appendExpenseLog(guildId, yearMonth, newEntry) {
  const logPath = getExpenseLogPath(guildId, yearMonth);
  let data = [];

  try {
    if (fs.existsSync(logPath)) {
      data = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    }
    data.push(newEntry);
    fs.writeFileSync(logPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`❌ 経費ログ保存エラー (${guildId}/${yearMonth}):`, err);
  }
}

function getExpenseEntries(guildId, yearMonth, userId = null) {
  const logPath = getExpenseLogPath(guildId, yearMonth);
  try {
    if (!fs.existsSync(logPath)) return [];
    const entries = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    return userId ? entries.filter(e => e.userId === userId) : entries;
  } catch (err) {
    console.error(`❌ 経費ログ読み込みエラー (${guildId}/${yearMonth}):`, err);
    return [];
  }
}

function updateApprovalStatus(guildId, yearMonth, threadMessageId, userId, username) {
  const logPath = getExpenseLogPath(guildId, yearMonth);
  try {
    if (!fs.existsSync(logPath)) return;
    const data = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    const target = data.find(e => e.threadMessageId === threadMessageId);
    if (!target) return;
    if (!target.approvedBy) target.approvedBy = [];

    const alreadyApproved = target.approvedBy.find(a => a.userId === userId);
    if (!alreadyApproved) {
      target.approvedBy.push({ userId, username });
      fs.writeFileSync(logPath, JSON.stringify(data, null, 2));
    }

    return target.approvedBy;
  } catch (err) {
    console.error(`❌ 承認更新エラー (${guildId}/${yearMonth}):`, err);
    return [];
  }
}

function getAvailableExpenseFiles(guildId) {
  const dirPath = getGuildDir(guildId);
  try {
    if (!fs.existsSync(dirPath)) return [];

    return fs.readdirSync(dirPath)
      .filter(name => /^\d{4}-\d{2}\.json$/.test(name))
      .map(name => name.replace('.json', ''));
  } catch (err) {
    console.error(`❌ ファイル一覧取得エラー (${guildId}):`, err);
    return [];
  }
}

module.exports = {
  loadGuildData,
  saveGuildData,
  getApproverRoles,
  setApproverRoles,
  appendExpenseLog,
  getExpenseEntries,
  updateApprovalStatus,
  getAvailableExpenseFiles
};
