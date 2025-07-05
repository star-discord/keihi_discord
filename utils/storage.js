const { Storage } = require('@google-cloud/storage');

const storage = new Storage();
const bucketName = process.env.BUCKET_NAME || 'star-chat-gpt-discord-bot';
const bucket = storage.bucket(bucketName);

/**
 * Cloud Storage から JSON ファイルを読み込む
 * @param {string} fileName - 例: 'chat_config.json'
 * @returns {Promise<object>} - パースされた JSON オブジェクト
 */
async function loadJson(fileName) {
  const file = bucket.file(fileName);
  try {
    const [contents] = await file.download();
    return JSON.parse(contents.toString());
  } catch (err) {
    console.warn(`⚠️ Cloud Storage から ${fileName} の読み込みに失敗:`, err.message);
    return {}; // 初回用に空オブジェクト返す
  }
}

/**
 * Cloud Storage に JSON ファイルを書き込む
 * @param {string} fileName - 例: 'chat_config.json'
 * @param {object} data - 保存する JSON オブジェクト
 */
async function saveJson(fileName, data) {
  const file = bucket.file(fileName);
  try {
    await file.save(JSON.stringify(data, null, 2));
    console.log(`✅ Cloud Storage に ${fileName} を保存しました。`);
  } catch (err) {
    console.error(`❌ Cloud Storage への ${fileName} 保存失敗:`, err.message);
  }
}

module.exports = {
  loadJson,
  saveJson
};


