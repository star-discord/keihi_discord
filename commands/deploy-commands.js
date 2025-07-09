const { REST, Routes } = require('discord.js');
const loadCommands = require('./utils/loadCommands');
require('dotenv').config();

const { CLIENT_ID, GUILD_ID, TOKEN } = process.env;

if (!CLIENT_ID || !GUILD_ID || !TOKEN) {
  console.error('❌ .env の CLIENT_ID, GUILD_ID, TOKEN が不足しています');
  process.exit(1);
}

const commandsPath = `${__dirname}/commands`;
const commands = loadCommands(commandsPath, { mode: 'deploy', toJSON: true });

// dev_で始まるコマンドを除外
const filtered = commands.filter(cmd => !cmd.name.startsWith('dev_'));

// 重複チェック
const names = filtered.map(c => c.name);
const duplicates = names.filter((n, i) => names.indexOf(n) !== i);
if (duplicates.length > 0) {
  console.warn('⚠️ 重複しているコマンド名があります:', [...new Set(duplicates)]);
  process.exit(1);
}

console.log('📡 スラッシュコマンドを完全クリアして再デプロイします...');

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    // 1. ギルドのコマンドを空配列で上書き → 全削除
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: [] }
    );
    console.log('🗑️ 既存のギルドコマンドを全て削除しました');

    // 2. 新規コマンドを登録
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: filtered }
    );
    console.log('✅ スラッシュコマンドの再登録が完了しました！');
  } catch (err) {
    console.error('❌ コマンド登録失敗:', err);
  }
})();
