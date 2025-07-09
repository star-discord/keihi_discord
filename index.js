// index.js
const fs = require('fs');
const path = require('path');
const { getDataPath } = require('./utils/pathUtils.js');
const { getExpenseEntries } = require('./utils/fileStorage.js'); // ← これを追加
const { createSpreadsheet, appendEntry, initSheets } = require('./utils/spreadsheet.js');
const { google } = require('googleapis');
const drive = google.drive('v3');

async function setReadOnlyPermission(spreadsheetId) {
  try {
    await drive.permissions.create({
      fileId: spreadsheetId,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });
    console.log(`🔒 スプレッドシートを閲覧専用に設定しました`);
  } catch (err) {
    console.error(`❌ パーミッション設定失敗:`, err);
  }
}

async function createMonthlySpreadsheet(guildId, yearMonth) {
  await initSheets();

  const entries = getExpenseEntries(guildId, yearMonth);
  if (!entries.length) {
    console.warn(`📭 ${yearMonth}: 申請ログが見つかりません`);
    return null;
  }

  const spreadsheetTitle = `${yearMonth} 経費申請ログ (${guildId})`;
  const headers = ['ユーザー名', '日時', '経費項目', '金額', '詳細', '承認状況'];
  const spreadsheetId = await createSpreadsheet(spreadsheetTitle, headers);
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  for (const entry of entries) {
    const username = entry.userName || '不明';
    const timestamp = entry.timestamp || '';
    const item = entry.item || '';
    const amount = Number(entry.amount || 0); // 数値として書き込み
    const detail = entry.detail || '';

    const approved = entry.approvedBy || [];
    const approvedCount = approved.length;
    const approverNames = approved.map(a => a.username).join(', ') || 'なし';
    const statusEmoji = approvedCount > 0 ? '✅' : '❌';
    const approvalStatus = `${statusEmoji} (${approvedCount}/3): ${approverNames}`;

    await appendEntry(spreadsheetId, {
      username,
      timestamp,
      item,
      amount,
      detail,
      approvalStatus
    });
  }

  // ✅ 集計行を追加（最終行）
  const totalFormula = `=SUM(D2:D${entries.length + 1})`; // D列 = 金額列
  const countLabel = `件数: ${entries.length}件`;

  await appendEntry(spreadsheetId, {
    username: '',
    timestamp: '',
    item: '合計',
    amount: totalFormula,
    detail: countLabel,
    approvalStatus: ''
  });

  // ✅ URL を保存
  const filePath = getDataPath(guildId, 'logs', `${yearMonth}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  data[0].spreadsheetUrl = spreadsheetUrl;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

  // ✅ 閲覧専用に設定
  await setReadOnlyPermission(spreadsheetId);

  console.log(`✅ スプレッドシート作成: ${spreadsheetUrl}`);
  return spreadsheetUrl;
}

async function createMonthlySpreadsheetIfNeeded(guildId, yearMonth) {
  const filePath = getDataPath(guildId, 'logs', `${yearMonth}.json`);
  if (!fs.existsSync(filePath)) return;

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  if (data[0]?.spreadsheetUrl) {
    console.log(`🟡 ${yearMonth}: 既にスプレッドシートURLあり → スキップ`);
    return;
  }

  await createMonthlySpreadsheet(guildId, yearMonth);
}

module.exports = {
  createMonthlySpreadsheet,
  createMonthlySpreadsheetIfNeeded
};
