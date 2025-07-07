// selectMenuHandler.js

const fs = require('fs');
const path = require('path');

const selectsDir = path.join(__dirname, 'selectMenus');
const selectHandlers = new Map();

fs.readdirSync(selectsDir).forEach(file => {
  if (file.endsWith('.js')) {
    const name = file.replace('.js', '');
    const handler = require(path.join(selectsDir, file));
    selectHandlers.set(name, handler);
  }
});

module.exports = async function handleSelectMenu(interaction) {
  const customId = interaction.customId;

  for (const [key, handler] of selectHandlers.entries()) {
    if (customId === key || customId.startsWith(`${key}_`)) {
      return handler(interaction);
    }
  }

  console.warn(`⚠️ 未対応のセレクトメニュー: ${customId}`);
};
