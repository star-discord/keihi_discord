// index.js
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const loadCommands = require('./utils/loadCommands.js');

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.commands = new Collection();

// 🔽 コマンド読み込み
const commandsPath = path.join(__dirname, 'commands');
const commandModules = loadCommands(commandsPath); // mode = 'index' は省略可

for (const command of commandModules) {
  client.commands.set(command.data.name, command);
}

// 🔽 イベント読み込み
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
    loadEvents();
    await client.login(process.env.DISCORD_TOKEN);
    console.log(`✅ ログイン成功: ${client.user.tag}`);
  } catch (err) {
    console.error('❌ 起動エラー:', err);
    process.exit(1);
  }
})();

// グローバルエラー処理
process.on('unhandledRejection', (reason) => {
  console.error('⚠️ Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception:', err);
});
