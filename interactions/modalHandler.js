const fs = require('fs');
const path = require('path');

const modalsDir = path.join(__dirname, 'modals');
const modalHandlers = new Map();

fs.readdirSync(modalsDir).forEach(file => {
  if (file.endsWith('.js')) {
    const name = file.replace('.js', '');
    const handler = require(path.join(modalsDir, file));
    modalHandlers.set(name, handler);
  }
});

module.exports = async function handleModal(interaction) {
  const customId = interaction.customId;

  for (const [key, handler] of modalHandlers.entries()) {
    if (customId === key || customId.startsWith(`${key}_`)) {
      return handler(interaction);
    }
  }

  console.warn(`⚠️ 未対応のモーダル: ${customId}`);
};
