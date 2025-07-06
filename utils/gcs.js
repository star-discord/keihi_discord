const { Storage } = require('@google-cloud/storage');

const storage = new Storage();
const bucketName = 'your-bucket-name'; // ← あなたの GCS バケット名に置き換えてください
const fileName = 'keihi_approver_roles.json';

async function getApproverRoles(guildId) {
  const file = storage.bucket(bucketName).file(fileName);

  try {
    const [contents] = await file.download();
    const data = JSON.parse(contents.toString());
    return data[guildId]?.approverRoles || [];
  } catch (err) {
    console.warn(`[WARN] 承認ロール読み込み失敗: ${err.message}`);
    return [];
  }
}

async function setApproverRoles(guildId, roles) {
  const file = storage.bucket(bucketName).file(fileName);
  let data = {};

  try {
    const [contents] = await file.download();
    data = JSON.parse(contents.toString());
  } catch (err) {
    console.warn(`[INFO] 新規ファイル作成: ${fileName}`);
  }

  data[guildId] = { approverRoles: roles };
  await file.save(JSON.stringify(data, null, 2));
}

module.exports = {
  getApproverRoles,
  setApproverRoles
};
