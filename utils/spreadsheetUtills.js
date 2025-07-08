// utils/spreadsheetUtills.js

const fs = require('fs');
const path = require('path');

// 経費データをスプレッドシート（CSV）として保存
function saveToSpreadsheet({ guildId, guildName, channelName, yearMonth, data }) {
  const safeGuildName = sanitizeFileName(guildName);
  const safeChannelName = sanitizeFileName(channelName);
  const fileName = `${safeChannelName}_${safeGuildName}_${yearMonth}.csv`;
  const dirPath = path.join(__dirname, '..', 'data', guildId);
  const filePath = path.join(dirPath, fileName);

  // ディレクトリがなければ作成
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const headers = ['申請者', '項目', '金額', '詳細', '申請日時'];
  const row = [
    data.userName,
    data.item,
    `¥${data.amount.toLocaleString()}`,
    data.detail,
    formatDateTime(data.timestamp)
  ];

  let csv = '';
  if (!fs.existsSync(filePath)) {
    // ヘッダー付きで新規作成
    csv += headers.join(',') + '\n';
  }

  csv += row.map(escapeCsv).join(',') + '\n';
  fs.appendFileSync(filePath, csv, 'utf8');

  return filePath;
}

// ファイル名に使えない文字を削除
function sanitizeFileName(name) {
  return name.replace(/[\\/:*?"<>| ]+/g, '_');
}

// 日時を yyyy-mm-dd hh:mm:ss に整形
function formatDateTime(timestamp) {
  const date = new Date(timestamp);
  return date.toISOString().replace('T', ' ').slice(0, 19);
}

// CSV用にクォートする
function escapeCsv(value) {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

module.exports = {
  saveToSpreadsheet,
};
