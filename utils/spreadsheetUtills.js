// utils/spreadsheetUtills.js

const { google } = require('googleapis');
const { getOrCreateGuildFolder } = require('./driveUtils.js');
require('dotenv').config();

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets']
});

async function createAndSaveSpreadsheet(guildId, yearMonth, entries) {
  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });
  const drive = google.drive({ version: 'v3', auth: authClient });

  const folderId = await getOrCreateGuildFolder(guildId);

  // シート作成
  const sheetTitle = `経費申請_${guildId}_${yearMonth}`;
  const createRes = await sheets.spreadsheets.create({
    resource: {
      properties: { title: sheetTitle },
      sheets: [{ properties: { title: '申請履歴' } }]
    },
    fields: 'spreadsheetId'
  });

  const spreadsheetId = createRes.data.spreadsheetId;

  // Driveフォルダへ移動
  await drive.files.update({
    fileId: spreadsheetId,
    addParents: folderId,
    fields: 'id, parents'
  });

  // 公開リンク設定（閲覧専用）
  await drive.permissions.create({
    fileId: spreadsheetId,
    requestBody: {
      role: 'reader',
      type: 'anyone'
    }
  });

  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  // データ行を作成
  const rows = [
    ['ユーザー名', '日時', '経費項目', '金額', '詳細', '承認状況']
  ];

  for (const e of entries) {
    const approved = e.approvedBy?.length
      ? `承認 (${e.approvedBy.length})：${e.approvedBy.map(a => a.username).join(', ')}`
      : '未承認';

    rows.push([
      e.userName || '不明',
      e.timestamp || '',
      e.item || '',
      e.amount ?? '',
      e.detail || '',
      approved
    ]);
  }

  // 合計行を追加
  const total = entries.reduce((sum, e) => sum + (e.amount || 0), 0);
  rows.push([]);
  rows.push(['合計', '', '', total, '', '件数: ' + entries.length]);

  // 書き込み
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: '申請履歴!A1',
    valueInputOption: 'RAW',
    resource: {
      values: rows
    }
  });

  return spreadsheetUrl;
}

module.exports = {
  createAndSaveSpreadsheet
};

