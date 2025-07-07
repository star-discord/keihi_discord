// butt// buttonHandler.js

const fs = require('fs');
const path = require('path');

const handlers = new Map();

// buttons フォルダ内のすべてのボタン処理を読み込む
const buttonsDir = path.join(__dirname, 'buttons');
fs.readdirSync(buttonsDir).forEach(file => {
  if (file.endsWith('.js')) {
    const name = file.replace('.js', '');  // ファイル名から拡張子を除去
    const handler = require(path.join(buttonsDir, file));  // ボタン処理を読み込む
    handlers.set(name, handler);  // 'apply' などのカスタムIDをキーとして処理を登録
  }
});

module.exports = async function handleButton(interaction) {
  const customId = interaction.customId;  // 受け取ったカスタムID（ボタンのID）

  // handlers マップ内でカスタムIDが一致する処理を探して実行
  for (const [key, handler] of handlers.entries()) {
    if (customId === key || customId.startsWith(`${key}_`)) {
      return handler(interaction);  // 一致する処理を実行
    }
  }

  console.warn(`⚠️ 未対応のボタン: ${customId}`);
};

