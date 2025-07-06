// index.js
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// コマンド格納用コレクション
client.commands = new Collection();

// 🔽 コマンド読み込み処理
const loadCommands = () => {
  const commandsPath = path.join(__dirname, 'commands');
  const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    const commandData = command.default ?? command;

    if (commandData.data?.name && typeof commandData.execute === 'function') {
      client.commands.set(commandData.data.name, commandData);
      console.log(`✅ コマンド読み込み成功: ${file}`);
    } else {
      console.warn(`⚠️ 無効なコマンド形式: ${file}`);
    }
  }
};

// 🔽 イベント読み込み処理
const loadEvents = () => {
  const eventsPath = path.join(__dirname, 'events');
  const files = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    const eventData = event.default ?? event;

    if (!eventData?.name || typeof eventData.execute !== 'function') continue;

    if (eventData.once) {
      client.once(eventData.name, (...args) => eventData.execute(...args, client));
    } else {
      client.on(eventData.name, (...args) => eventData.execute(...args, client));
    }

    console.log(`✅ イベント読み込み成功: ${file}`);
  }
};

// 🔽 起動処理
(async () => {
  try {
    loadCommands();
    loadEvents();

    await client.login(process.env.DISCORD_TOKEN);

    console.log(`✅ ログイン成功: ${client.user.tag}`);
  } catch (err) {
    console.error('❌ 起動エラー:', err);
    process.exit(1);
  }
})();

// 🔽 グローバルなエラーハンドリング
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection:', reason);
});

process.on('uncaughtException', err => {
  console.error('⚠️ Uncaught Exception:', err);
});

