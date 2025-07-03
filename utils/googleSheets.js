import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const CREDENTIALS_PATH = path.resolve('./credentials.json'); // サービスアカウントJSONのパス
const SPREADSHEET_ID = 'あなたのスプレッドシートIDをここに入れてください';

let sheetsClient = null;

async function authorize() {
  if (sheetsClient) return sheetsClient;

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });

  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

/**
 * 月別シートに行を書き込み（なければシート作成）
 * @param {string} yearMonth 'YYYY-MM'形式
 * @param {Array} rowData 書き込みデータ配列 (例: [日時, ユーザー名, 経費項目, 金額, 備考])
 */
export async function appendRowToSheet(yearMonth, rowData) {
  const sheets = await authorize();

  // まずシート一覧を取得
  const sheetInfo = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });

  const sheetExists = sheetInfo.data.sheets.some(sheet => sheet.properties.title === yearMonth);

  // シートがなければ作成
  if (!sheetExists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: yearMonth,
            },
          },
        }],
      },
    });

    // ヘッダー行を追加
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${yearMonth}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['日時', 'ユーザー名', '経費項目', '金額', '備考']],
      },
    });
  }

  // データ行を追加
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${yearMonth}!A2`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [rowData],
    },
  });
}
