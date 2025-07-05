//expenseStorage.js

const path = require('path');
const { Storage } = require('@google-cloud/storage');

const bucketName = 'keihi-discord-bot-data-948332309706';
const fileName = 'keihi/expenses_all.json';

const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

async function getAllExpenses() {
  const file = storage.bucket(bucketName).file(fileName);
  const [exists] = await file.exists();
  if (!exists) return {};
  const contents = await file.download();
  return JSON.parse(contents[0].toString());
}

async function saveAllExpenses(data) {
  const file = storage.bucket(bucketName).file(fileName);
  await file.save(JSON.stringify(data, null, 2), {
    contentType: 'application/json',
  });
}

async function getUserExpenses(userId, yearMonth = null) {
  const allData = await getAllExpenses();
  const result = [];

  for (const ym in allData) {
    if (yearMonth && ym !== yearMonth) continue;
    for (const entry of allData[ym]) {
      if (entry.userId === userId) result.push(entry);
    }
  }

  return result;
}

module.exports = {
  getUserExpenses,
  getAllExpenses,
  saveAllExpenses
};
