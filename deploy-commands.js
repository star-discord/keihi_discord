// deploy-commands.js
const { REST, Routes } = require('discord.js');
const dotenv = require('dotenv');
const path = require('path');
const loadCommands = require('./utils/loadCommands');

dotenv.config();

// 🔽 commands フォルダから読み込み
const commandsPath = path.join(__dirname, 'commands');
const commandModules = loadCommands(commandsPath, 'deploy');

// 🔽 Discord に送信する JSON 配列を生成
const commands = commandModules
  .filter(cmd => cmd?.data?.toJSON)
  .map(cmd => cmd.data.toJSON);

async function deployCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  if (commands.length === 0) {
    console.warn('⚠️ 登録対象のコマンドがありません。');
    return;
  }

  const isDevelopment = Boolean(process.env.GUILD_ID);
  const route = isDevelopment
    ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
    : Routes.applicationCommands(process.env.CLIENT_ID);

  try {
    const result = await rest.put(route, { body: commands });
    console.log(`📤 ${isDevelopment ? '開発ギルド' : '全体'}に ${commands.length} 件のコマンドを登録しました`);
  } catch (err) {
    console.error('❌ コマンド登録失敗:', err);
  }
}

deployCommands();
