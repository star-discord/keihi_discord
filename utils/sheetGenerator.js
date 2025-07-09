// utils/sheetGenerator.js

const fs = require('fs');
const path = require('path');
const { getExpenseEntries } = require('./fileStorage.js');
const { getDataPath } = require('./pathUtils.js');
const { createSpreadsheet, appendEntry, initSheets } = require('./spreadsheet.js');

/**
 * 指定月の全申請を Google Sheets に出力し、最初のエントリに URL を追記
 */
async function createMonthlySpreadsheet(guildId, yearMonth) {
  await initSheets();

  const entries = getExpenseEntries(guildId, yearMonth);
  if (!entries.length) {
    console.warn(`📭 ${yearMonth}: 申請ログが見つかりません`);
    return null;
  }

  const spreadsheetTitle = `${yearMonth} 経費申請ログ (${guildId})`;
  const spreadsheetId = await createSpreadsheet(spreadsheetTitle, [
    'ユーザー名',
    '経費項目',
    '金額',
    '詳細',
    '承認状況'
  ]);

  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  for (const entry of entries) {
    const username = entry.userName || '不明';
    const item = entry.item || '';
    const amount = Number(entry.amount || 0);
    const formattedAmount = `¥${amount.toLocaleString('ja-JP')}`;
    const detail = entry.detail || '';

    const approved = entry.approvedBy || [];
    const approvedCount = approved.length;
    const approverNames = approved.map(a => a.username).join(', ') || 'なし';
    const statusEmoji = approvedCount > 0 ? '✅' : '❌';
    const approvalStatus = `${statusEmoji} (${approvedCount}/3): ${approverNames}`;

    await appendEntry(spreadsheetId, {
      username,
      item,
      amount: formattedAmount,
      detail,
      approvalStatus
    });
  }

  // ✅ 最初のログに URL を保存
  const filePath = getDataPath(guildId, 'logs', `${yearMonth}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  data[0].spreadsheetUrl = spreadsheetUrl;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

  console.log(`✅ スプレッドシート作成: ${spreadsheetUrl}`);
  return spreadsheetUrl;
}

/**
 * すでにURLが存在する場合はスキップする安全版
 */
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
