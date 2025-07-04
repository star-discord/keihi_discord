import { google } from 'googleapis';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '';
const CREDENTIALS_PATH = process.env.CREDENTIALS_PATH || path.resolve('./credentials.json');

let sheetsClient = null;

async function authorize() {
  if (sheetsClient) return sheetsClient;

  let credentials;
  if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  } else {
    try {
      credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    } catch (e) {
      console.error(`credentials.json 読み込み失敗: ${CREDENTIALS_PATH}`, e);
      throw e;
    }
  }

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
  try {
    const sheets = await authorize();

    const sheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheetExists = sheetInfo.data.sheets.some(
      (sheet) => sheet.properties.title === yearMonth
    );

    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{ addSheet: { properties: { title: yearMonth } } }],
        },
      });

      // ヘッダー行を作成
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
      requestBody: { values: [rowData] },
    });

    console.log(`✅ シート「${yearMonth}」にデータ追加完了`);
  } catch (error) {
    console.error('❌ スプレッドシート操作中にエラーが発生しました:', error);
    throw error;
  }
}
