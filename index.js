// index.js
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.commands = new Collection();

const loadCommands = () => {
  const commandsPath = path.join(__dirname, 'commands');
  const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if (command.data?.name && typeof command.execute === 'function') {
      client.commands.set(command.data.name, command);
      console.log(`✅ コマンド読み込み成功: ${file}`);
    } else {
      console.warn(`⚠️ 無効なコマンド形式: ${file}`);
    }
  }
};

const loadEvents = () => {
  const eventsPath = path.join(__dirname, 'events');
  const files = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (!event?.name || typeof event.execute !== 'function') continue;

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }

    console.log(`✅ イベント読み込み成功: ${file}`);
  }
};

(async () => {
  try {
    loadCommands();
    loadEvents();

    await client.login(process.env.DISCORD_TOKEN);
    console.log(`✅ ログイン成功: ${client.user?.tag}`);
  } catch (err) {
    console.error('❌ 起動エラー:', err);
    process.exit(1);
  }
})();

// エラーハンドリング
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection:', reason);
});

process.on('uncaughtException', err => {
  console.error('⚠️ Uncaught Exception:', err);
});
