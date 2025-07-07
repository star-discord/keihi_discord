// deploy-commands.js
const { REST, Routes } = require('discord.js');
const dotenv = require('dotenv');
const path = require('path');
const loadDeployCommands = require('./utils/loadDeployCommands');

dotenv.config();

const commandsPath = path.join(__dirname, 'commands');
const commands = loadDeployCommands(commandsPath); // すでに toJSON 済み

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
    console.log(`✅ ${isDevelopment ? '開発ギルド' : '全体'}に ${commands.length} 件のコマンドを登録しました`);
  } catch (err) {
    console.error('❌ コマンド登録失敗:', err);
  }
}

deployCommands();

