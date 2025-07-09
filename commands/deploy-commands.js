// deploy-commands.js
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

// dev フォルダ内のコマンドを除外（例: name が "dev_..." で始まる）
const filtered = commands.filter(cmd => !cmd.name.startsWith('dev_'));

console.log('📡 スラッシュコマンドをデプロイ中...');

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log(`📦 ${filtered.length} 件のコマンドを登録中...`);
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: filtered }
    );
    console.log('✅ スラッシュコマンドの登録が完了しました！');
  } catch (err) {
    console.error('❌ コマンド登録失敗:', err);
  }
})();

