// utils/loadCommands.js
const fs = require('fs');
const path = require('path');

function loadCommands(commandsPath, mode = 'index') {
  const commands = [];
  const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(commandsPath, file);
    try {
      const command = require(filePath);
      const commandData = command.default ?? command;

      if (commandData?.data?.name && typeof commandData.execute === 'function') {
        commands.push(commandData);
        console.log(`✅ [${mode}] コマンド読み込み成功: ${file}`);
      } else {
        console.warn(`⚠️ [${mode}] 無効なコマンド形式: ${file}`);
      }
    } catch (err) {
      console.error(`❌ [${mode}] コマンド読み込み失敗 (${file}):`, err);
    }
  }

  return commands;
}

module.exports = loadCommands;
