const fs = require('fs');
const path = require('path');

/**
 * 指定フォルダ内のすべてのコマンドを読み込む
 * @param {string} commandsPath - 読み込むコマンドフォルダ
 * @param {string} mode - ログ出力モード ('index', 'deploy' など)
 * @returns {Array} 有効なコマンドモジュールの配列
 */
function loadCommands(commandsPath, mode = 'index') {
  const commands = [];
  const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(commandsPath, file);
    try {
      const command = require(filePath);
      const commandData = command.default ?? command;

      // --- 厳密なバリデーション ---
      const name = commandData?.data?.name;
      const execute = commandData?.execute;

      if (typeof name !== 'string') {
        throw new Error(`.data.name が無効です（${typeof name}）`);
      }

      if (typeof execute !== 'function') {
        throw new Error(`.execute が無効です（${typeof execute}）`);
      }

      commands.push(commandData);
      console.log(`✅ [${mode}] コマンド読み込み成功: ${file}`);

    } catch (err) {
      console.error(`❌ [${mode}] コマンド読み込み失敗 (${file}):`, err.message);
    }
  }

  return commands;
}

module.exports = loadCommands;
