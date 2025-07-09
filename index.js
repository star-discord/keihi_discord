// index.js
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
require('dotenv').config();

const { initServer } = require('./utils/initUtils.js');
const { loadCommands } = require('./utils/loadCommands.js');

// ✅ クライアント初期化
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.commands = new Collection();

// ✅ コマンド読み込み
loadCommands(client);

// ✅ イベント読み込み
client.once(Events.ClientReady, async () => {
  console.log(`✅ ログイン成功: ${client.user.tag}`);
  await initServer(client);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.warn(`⚠️ 未登録のコマンド: ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ コマンド実行失敗:`, error);
    await interaction.reply({ content: 'コマンド実行時にエラーが発生しました。', ephemeral: true });
  }
});

// ✅ ログイン
client.login(process.env.DISCORD_TOKEN);
