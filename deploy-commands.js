import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

config();

const commands = [];
const commandsPath = path.resolve('./commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

async function loadCommands() {
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    try {
      const commandModule = await import(`file://${filePath}`);
      const command = commandModule.default ?? commandModule;
      if (command.data && typeof command.data.toJSON === 'function') {
        commands.push(command.data.toJSON());
        console.log(`✅ 読み込み成功: ${file}`);
      } else {
        console.warn(`⚠️ スキップ: ${file} に有効な data.toJSON() が見つかりません。`);
      }
    } catch (err) {
      console.error(`❌ 読み込み失敗: ${file}`, err);
    }
  }
}

async function deployCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  try {
    await loadCommands();

    const isDevelopment = Boolean(process.env.GUILD_ID); // 本番環境かどうか判断

    console.log(`📤 ${isDevelopment ? '開発サーバー' : '全体'} にコマンド登録中...`);

    const route = isDevelopment
      ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
      : Routes.applicationCommands(process.env.CLIENT_ID);

    const response = await rest.put(route, { body: commands });
    console.log(`✅ ${response.length} 件のコマンドを登録しました`);
  } catch (error) {
    console.error('❌ コマンド登録失敗:', error);
  }
}

deployCommands();
