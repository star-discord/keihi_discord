// index.js
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
require('dotenv').config();

// ✅ クライアント初期化
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

// ✅ コマンドを読み込むコレクションを初期化
client.commands = new Collection();

// ✅ コマンドディレクトリ読み込み（機能別に整理された構成）
const commandsPath = path.join(__dirname, 'commands');
const commandCategories = fs.readdirSync(commandsPath);

for (const category of commandCategories) {
  const categoryPath = path.join(commandsPath, category);
  const commandFiles = fs
    .readdirSync(categoryPath)
    .filter(file => file.endsWith('.js') && file !== 'index.js');

  for (const file of commandFiles) {
    const filePath = path.join(categoryPath, file);
    const command = require(filePath);
    if (command.data && command.execute) {
      const commandName = command.data.name || path.parse(file).name;
      client.commands.set(commandName, command);
      console.log(`✅ [index] コマンド読み込み成功: ${category}/${file}`);
    } else {
      console.warn(`⚠️ [index] コマンド形式エラー: ${category}/${file}`);
    }
  }
}

// ✅ イベント読み込み
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
  console.log(`✅ [index] イベント登録: ${file}`);
}

// ✅ 起動処理
client.login(process.env.DISCORD_TOKEN).then(() => {
  console.log('🚀 Botログイン成功');
}).catch(err => {
  console.error('❌ Botログイン失敗:', err);
});
