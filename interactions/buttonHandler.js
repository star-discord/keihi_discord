// buttonHandler.js
const fs = require('fs');
const path = require('path');

const handlers = new Map();

// buttons フォルダ内のすべてのボタン処理を読み込む
const buttonsDir = path.join(__dirname, 'buttons');
fs.readdirSync(buttonsDir).forEach(file => {
  if (file.endsWith('.js')) {
    const name = file.replace('.js', '');
    const handler = require(path.join(buttonsDir, file));
    handlers.set(name, handler);
  }
});

module.exports = async function handleButton(interaction) {
  const customId = interaction.customId;

  for (const [key, handler] of handlers.entries()) {
    if (customId === key || customId.startsWith(`${key}_`)) {
      return handler(interaction);
    }
  }

console.warn(`⚠️ 未対応のボタン: ${customId}`);
// その下に以下を追加（またはすでにある場合はコメントを削除）：
await interaction.reply({
  content: '⚠️ このボタンは古くて無効になっています。',
  ephemeral: true,
});
