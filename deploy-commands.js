// deploy-commands.js
import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commands = [];

async function loadCommands() {
  const commandsPath = path.join(__dirname, 'commands');
  let commandFiles;

  try {
    commandFiles = (await fs.readdir(commandsPath)).filter(file => file.endsWith('.js'));
  } catch (err) {
    console.error('❌ コマンドディレクトリ読み込みエラー:', err);
    return;
  }

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    try {
      const commandModule = await import(`file://${filePath}`);
      const command = commandModule.default ?? commandModule;
      if (command?.data?.toJSON) {
        commands.push(command.data.toJSON());
        console.log(`✅ コマンド読み込み成功: ${file}`);
      } else {
        console.warn(`⚠️ 無効なコマンド形式: ${file}`);
      }
    } catch (err) {
      console.error(`❌ コマンド読み込み失敗: ${file}`, err);
    }
  }
}

async function deployCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  await loadCommands();

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

