// utils/loadCommands.js
const fs = require('fs');
const path = require('path');

/**
 * commands フォルダを再帰的に読み込み
 * 
 * @param {string} commandsPath - 読み込むディレクトリ
 * @param {Object} options
 * @param {string} [options.mode='index'] - ログ出力用
 * @param {boolean} [options.toJSON=false] - toJSONで返すか（deploy用）
 * @returns {Array<Object>} - コマンド配列
 */
function loadCommands(commandsPath, { mode = 'index', toJSON = false } = {}) {
  const commands = [];

  const entries = fs.readdirSync(commandsPath, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const subFile = path.join(commandsPath, entry.name, `${entry.name}.js`);
    if (!fs.existsSync(subFile)) continue;

    try {
      const command = require(subFile);
      const commandData = command.default ?? command;

      const name = commandData?.data?.name;
      const execute = commandData?.execute;

      if (typeof name !== 'string') throw new Error(`.data.name が無効`);
      if (typeof execute !== 'function') throw new Error(`.execute が無効`);

      const result = toJSON ? commandData.data.toJSON() : commandData;
      commands.push(result);

      console.log(`✅ [${mode}] コマンド読み込み: ${entry.name}/${entry.name}.js`);
    } catch (err) {
      console.error(`❌ [${mode}] 読み込み失敗 (${entry.name}):`, err.message);
    }
  }

  return commands;
}

module.exports = loadCommands;

