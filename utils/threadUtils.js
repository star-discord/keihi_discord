// utils/threadUtils.js

/**
 * 経費申請スレッド名を 500 件ごとに分割して生成する。
 * 例: "経費申請-2025-07(1~500)", "経費申請-2025-07(501~1000)"
 *
 * @param {string} baseName - ベースとなるスレッド名（例: 経費申請-2025-07）
 * @param {number} count - 現在の申請件数（この数に基づき範囲を決定）
 * @returns {string} スレッド名
 */
function getThreadName(baseName, count) {
  if (typeof count !== 'number' || count < 0) count = 0;

  const start = Math.floor(count / 500) * 500 + 1;
  const end = start + 499;

  return `${baseName}(${start}~${end})`;
}

module.exports = {
  getThreadName
};
