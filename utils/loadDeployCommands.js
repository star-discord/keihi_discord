const fs = require('fs');
const path = require('path');

/**
 * deploy-commands 用のコマンド読み込み処理
 * @param {string} commandsPath - 読み込むディレクトリパス
 * @returns {Array} toJSON() できるコマンドオブジェクトの配列
 */
function loadDeployCommands(commandsPath) {
  const commands = [];
  const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(commandsPath, file);

    try {
      const command = require(filePath);
      const commandData = command.default ?? command;

      // バリデーション
      if (
        typeof commandData?.data?.name !== 'string' ||
        typeof commandData?.data?.toJSON !== 'function'
      ) {
        throw new Error('コマンドデータが不正（data.name または data.toJSON が存在しない）');
      }

      commands.push(commandData.data.toJSON());
      console.log(`✅ [deploy] コマンド読み込み成功: ${file}`);
    } catch (err) {
      console.error(`❌ [deploy] コマンド読み込み失敗 (${file}):`, err.message);
    }
  }

  return commands;
}

module.exports = loadDeployCommands;

