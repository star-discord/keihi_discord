require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { chatWithOpenAI } = require('./utils/openai');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// スラッシュコマンド読み込み
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    console.log(`✅ コマンド読み込み成功: ${file}`);
  } else {
    console.warn(`⚠️ コマンド形式不正: ${file}`);
  }
}

// イベント読み込み
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
  console.log(`✅ イベント読み込み成功: ${file}`);
}

// メンション応答処理
client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;

  const configPath = path.resolve(__dirname, 'data/gpt_config.json');
  let trigger = `<@${client.user.id}>`; // デフォルトは @Bot メンション

  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (config.trigger) {
        trigger = config.trigger;
      }
    }
  } catch (e) {
    console.warn('⚠️ トリガー設定ファイル読み込み失敗:', e);
  }

  if (message.content.includes(trigger)) {
    const prompt = message.content.replace(trigger, '').trim();
    if (prompt.length === 0) return;
    try {
      await message.channel.sendTyping();
      const reply = await chatWithOpenAI(prompt);
      await message.reply(reply);
    } catch (err) {
      console.error('❌ OpenAI応答失敗:', err);
      await message.reply('⚠️ 応答中にエラーが発生しました。');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);

// HTTPポート（Cloud Run等のヘルスチェック用）
const http = require('http');
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('OK');
}).listen(port, () => {
  console.log(`HTTP server listening on port ${port}`);
});

