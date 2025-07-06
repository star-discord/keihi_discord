// deploy-commands.js (CommonJS版)
const { REST, Routes } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const commands = [];

function loadCommands() {
  const commandsPath = path.join(__dirname, 'commands');
  let commandFiles;

  try {
    commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  } catch (err) {
    console.error('❌ コマンドディレクトリ読み込みエラー:', err);
    return;
  }

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    try {
      const command = require(filePath);
      const commandData = command.default ?? command;

      if (commandData?.data?.toJSON) {
        commands.push(commandData.data.toJSON());
        console.log(`✅ コマンド読み込み成功: ${file}`);
      } else {
        console.warn(`⚠️ 無効なコマンド形式: ${file}`);
      }
    } catch (err) {
      console.error(`❌ コマンド読み込み失敗 (${file}):`, err);
    }
  }
}

async function deployCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  loadCommands();

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
