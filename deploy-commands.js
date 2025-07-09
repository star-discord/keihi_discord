// deploy-commands.js
require('dotenv').config();
const { REST, Routes } = require('discord.js');
const loadCommands = require('./utils/loadCommands'); // 統合済みのもの
const path = require('path');

const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID; // グローバル登録でなくギルド単位
const TOKEN = process.env.DISCORD_TOKEN;

(async () => {
  try {
    const commandsPath = path.join(__dirname, 'commands');

    // `toJSON: true` で JSON化して取得
    const commands = loadCommands(commandsPath, { mode: 'deploy', toJSON: true });

    const rest = new REST({ version: '10' }).setToken(TOKEN);

    console.log(`📦 ${commands.length} 件のコマンドを登録中...`);

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log('✅ スラッシュコマンドを登録しました');
  } catch (error) {
    console.error('❌ コマンド登録失敗:', error);
  }
})();

