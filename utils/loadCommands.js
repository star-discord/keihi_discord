const fs = require('fs');
const path = require('path');

/**
 * 指定フォルダ内のすべてのコマンドを読み込む（サブフォルダ対応）
 * @param {string} commandsPath - 読み込むコマンドフォルダ（例: ./commands）
 * @param {string} mode - ログ出力モード（例: 'index', 'deploy'）
 * @returns {Array} 有効なコマンドモジュールの配列
 */
function loadCommands(commandsPath, mode = 'index') {
  const commands = [];

  const entries = fs.readdirSync(commandsPath, { withFileTypes: true });

  for (const entry of entries) {
    let filePath;
    let label;

    if (entry.isFile() && entry.name.endsWith('.js')) {
      // commands/foo.js
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

      const name = commandData?.data?.name;
      const execute = commandData?.execute;

      if (typeof name !== 'string') {
        throw new Error(`.data.name が無効です（${typeof name}）`);
      }

      if (typeof execute !== 'function') {
        throw new Error(`.execute が無効です（${typeof execute}）`);
      }

      commands.push(commandData);
      console.log(`✅ [${mode}] コマンド読み込み成功: ${label}`);
    } catch (err) {
      console.error(`❌ [${mode}] コマンド読み込み失敗 (${label}):`, err.message);
    }
  }

  return commands;
}

module.exports = loadCommands;
