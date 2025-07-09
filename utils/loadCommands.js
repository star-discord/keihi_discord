const fs = require('fs');
const path = require('path');

/**
 * 指定フォルダ内のすべてのコマンドを読み込む（サブフォルダ内の単一ファイル対応）
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

    if (entry.isDirectory()) {
      // 例: keihi_embed/keihi_embed.js
      const commandFile = path.join(commandsPath, entry.name, `${entry.name}.js`);
      if (fs.existsSync(commandFile)) {
        filePath = commandFile;
        label = `${entry.name}/${entry.name}.js`;
      } else {
        continue;
      }
    } else {
      continue; // ファイル直下は読み込まない（全てサブディレクトリ方式に統一するなら）
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
