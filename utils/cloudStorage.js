
// utils/cloudStorage.js
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucketName = 'keihi-discord-bot-data-948332309706';

module.exports = {
  async saveToCloud(filePath, dataObj) {
    try {
      const file = storage.bucket(bucketName).file(filePath);
      await file.save(JSON.stringify(dataObj, null, 2), {
        contentType: 'application/json',
      });
      console.log(`✅ 保存完了: gs://${bucketName}/${filePath}`);
    } catch (err) {
      console.error('❌ Cloud Storage 書き込み失敗:', err);
    }
  },

  async loadFromCloud(filePath) {
    try {
      const file = storage.bucket(bucketName).file(filePath);
      const contents = await file.download();
      return JSON.parse(contents[0].toString());
    } catch (err) {
      console.error('❌ Cloud Storage 読み込み失敗:', err);
      return null;
    }
  }
};

