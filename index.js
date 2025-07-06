// ✅ index.js（不要な HTTP サーバー処理削除済み）

const { Client, Collection, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.commands = new Collection();

(async () => {
  try {
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(path.join(commandsPath, file));
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        console.log(`✅ コマンド読み込み成功: ${file}`);
      } else {
        console.warn(`⚠️ コマンド形式不正: ${file}`);
      }
    }

    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
      const event = require(path.join(eventsPath, file));
      if (!event || !event.name || !event.execute) continue;

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }

      console.log(`✅ イベント読み込み成功: ${file}`);
    }

    await client.login(process.env.DISCORD_TOKEN);
    console.log('✅ Discord client logged in successfully.');
  } catch (err) {
    console.error('❌ 初期ロードエラー:', err);
    process.exit(1);
  }
})();

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', error => {
  console.error('⚠️ Uncaught Exception thrown:', error);
});
