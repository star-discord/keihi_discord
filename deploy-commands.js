// deploy-commands.js
const fs = require('fs');
const path = require('path');

/**
 * 登録用にコマンドを .toJSON() 形式で収集する
 * @param {string} commandsPath - commands フォルダのパス
 * @returns {Array<Object>} JSON 形式のコマンド配列
 */
function loadDeployCommands(commandsPath) {
  const commands = [];

  const entries = fs.readdirSync(commandsPath, { withFileTypes: true });

  for (const entry of entries) {
    let filePath;

    if (entry.isFile() && entry.name.endsWith('.js')) {
      filePath = path.join(commandsPath, entry.name);
    } else if (entry.isDirectory()) {
      const indexPath = path.join(commandsPath, entry.name, 'index.js');
      if (fs.existsSync(indexPath)) {
        filePath = indexPath;
      } else {
        continue;
      }
    } else {
      continue;
    }

    try {
      const command = require(filePath);
      const commandData = command.default ?? command;
      if (commandData?.data?.toJSON) {
        commands.push(commandData.data.toJSON());
        console.log(`✅ コマンド登録読み込み: ${entry.name}`);
      } else {
        console.warn(`⚠️ toJSON 未対応のコマンドスキップ: ${entry.name}`);
      }
    } catch (err) {
      console.error(`❌ コマンド読み込み失敗 (${entry.name}):`, err.message);
    }
  }

  return commands;
}

module.exports = loadDeployCommands;
