// butt// buttonHandler.js

const fs = require('fs');
const path = require('path');

const buttonsDir = path.join(__dirname, 'buttons');
const buttonHandlers = new Map();

fs.readdirSync(buttonsDir).forEach(file => {
  if (file.endsWith('.js')) {
    const name = file.replace('.js', '');
    const handler = require(path.join(buttonsDir, file));
    buttonHandlers.set(name, handler);
  }
});

module.exports = async function handleButton(interaction) {
  const customId = interaction.customId;

  for (const [key, handler] of buttonHandlers.entries()) {
    if (customId === key || customId.startsWith(`${key}_`)) {
      return handler(interaction);
    }
  }

  console.warn(`⚠️ 未対応のボタン: ${customId}`);
};
