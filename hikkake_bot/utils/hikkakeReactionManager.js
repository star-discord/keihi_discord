// hikkake_bot/utils/hikkakeReactionManager.js

const { Storage } = require('@google-cloud/storage');

const bucketName = 'data-svml';
const basePath = 'hikkake';

const storage = new Storage();

/**
 * GCS 上のファイルパスを生成（例: hikkake/<GUILD_ID>/reactions.json）
 * @param {string} guildId 
 * @returns {string}
 */
function getReactionFilePath(guildId) {
  return `${basePath}/${guildId}/reactions.json`;
}

/**
 * リアクション初期構造
 * @returns {object}
 */
function getDefaultReactions() {
  return {
    quest: {},  // 例: quest["1人"] = ["ありがとう！", "助かる！"]
    tosu: {},
    horse: {}
  };
}

/**
 * リアクション設定を GCS から読み込み
 * @param {string} guildId 
 * @returns {Promise<object>}
 */
async function readReactions(guildId) {
  const file = storage.bucket(bucketName).file(getReactionFilePath(guildId));
  try {
    const [contents] = await file.download();
    return JSON.parse(contents.toString());
  } catch (e) {
    console.warn(`[GCS] reaction読み込み失敗: ${getReactionFilePath(guildId)} - ${e.message}`);
    return getDefaultReactions();
  }
}

/**
 * リアクション設定を GCS に保存
 * @param {string} guildId 
 * @param {object} reactionsData 
 * @returns {Promise<void>}
 */
async function writeReactions(guildId, reactionsData) {
  const file = storage.bucket(bucketName).file(getReactionFilePath(guildId));
  await file.save(JSON.stringify(reactionsData, null, 2));
}

/**
 * リアクションをランダムに取得（存在しない場合は null）
 * @param {object} reactions 全体のリアクション設定
 * @param {string} type quest | tosu | horse
 * @param {string} key "1人", "3本"など
 * @returns {string|null}
 */
function getRandomReaction(reactions, type, key) {
  const list = (reactions?.[type]?.[key] || []);
  if (!Array.isArray(list) || list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)];
}

module.exports = {
  readReactions,
  writeReactions,
  getRandomReaction,
};
