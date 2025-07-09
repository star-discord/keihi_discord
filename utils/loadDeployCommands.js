const fs = require('fs');
const path = require('path');

/**
 * deploy-commands 用のコマンド読み込み処理（サブディレクトリ index.js 対応）
 * @param {string} commandsPath - 読み込むディレクトリパス（通常 ./commands）
 * @returns {Array<Object>} SlashCommandBuilder の toJSON() 配列
 */
function loadDeployCommands(commandsPath) {
  const commands = [];

  const entries = fs.readdirSync(commandsPath, { withFileTypes: true });

  for (const entry of entries) {
    let filePath;
    let label;

    if (entry.isFile() && entry.name.endsWith('.js')) {
      // 例: commands/foo.js
      filePath = path.join(commandsPath, entry.name);
      label = entry.name;
    } else if (entry.isDirectory()) {
      const indexPath = path.join(commandsPath, entry.name, 'index.js');
      if (fs.existsSync(indexPath)) {
        filePath = indexPath;
        label = `${entry.name}/index.js`;
      } else {
        continue; // index.js がないサブフォルダはスキップ
      }
    } else {
      continue;
    }

    try {
      const command = require(filePath);
      const commandData = command.default ?? command;

      if (
        typeof commandData?.data?.name !== 'string' ||
        typeof commandData?.data?.toJSON !== 'function'
      ) {
        throw new Error('data.name または data.toJSON が不正');
      }

      commands.push(commandData.data.toJSON());
      console.log(`✅ [deploy] コマンド読み込み成功: ${label}`);
    } catch (err) {
      console.error(`❌ [deploy] コマンド読み込み失敗 (${label}):`, err.message);
    }
  }

  return commands;
}

module.exports = loadDeployCommands;
