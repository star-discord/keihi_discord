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

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath); // 再帰的にディレクトリ探索
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        try {
          const command = require(fullPath);
          const commandData = command.default ?? command;

          const name = commandData?.data?.name;
          const execute = commandData?.execute;

          if (typeof name !== 'string') throw new Error(`.data.name が無効`);
          if (typeof execute !== 'function') throw new Error(`.execute が無効`);

          const result = toJSON ? commandData.data.toJSON() : commandData;
          commands.push(result);

          const relativePath = path.relative(commandsPath, fullPath);
          console.log(`✅ [${mode}] コマンド読み込み: ${relativePath}`);
        } catch (err) {
          console.error(`❌ [${mode}] 読み込み失敗 (${entry.name}):`, err.message);
        }
      }
    }
  }

  walk(commandsPath);
  return commands;
}

module.exports = loadCommands;
