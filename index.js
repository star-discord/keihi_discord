// index.js
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
require('dotenv').config();

const { ensureDataFolder, backupDataFiles } = require('./utils/initUtils.js');
const loadCommands = require('./utils/loadCommands'); // ✅ 修正：分割代入ではなく直接関数として読み込む

// ✅ Discordクライアント初期化
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.commands = new Collection();

// ✅ コマンド読み込み
const commandsPath = path.join(__dirname, 'commands');
const commands = loadCommands(commandsPath, 'index');
for (const command of commands) {
  client.commands.set(command.data.name, command);
}
console.log(`📦 登録されたスラッシュコマンド数: ${client.commands.size}`);

// ✅ イベント読み込み
function loadEvents(dirPath) {
  const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.js'));

  for (const file of files) {
    try {
      const event = require(path.join(dirPath, file));
      if (event.name && typeof event.execute === 'function') {
        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args, client));
        } else {
          client.on(event.name, (...args) => event.execute(...args, client));
        }
        console.log(`📡 [event] 登録完了: ${event.name}`);
      } else {
        console.warn(`⚠️ [event] 無効な形式: ${file}`);
      }
    } catch (err) {
      console.error(`❌ [event] 読み込み失敗: ${file}`, err);
    }
  }
}

// ✅ 起動処理
(async () => {
  console.log('🚀 経費申請Bot 起動開始');

  const eventsPath = path.join(__dirname, 'events');

  loadEvents(eventsPath);

  // ✅ data/ のバックアップを作成
  backupDataFiles();

  try {
    await client.login(process.env.DISCORD_TOKEN);
    console.log('✅ Discordログイン成功');

    // ✅ ログイン後の初期設定
    client.once('ready', () => {
      client.user.setStatus('online');
      client.user.setActivity('経費申請を監視中', { type: 'WATCHING' });

      client.guilds.cache.forEach(guild => {
        ensureDataFolder(guild.id);

        const me = guild.members.me;
        if (me && me.manageable) {
          me.setNickname('STAR管理bot').catch(() => {});
        }
      });

      console.log(`🟢 Botとしてログイン完了: ${client.user.tag}`);
    });

  } catch (err) {
    console.error('❌ Discordログイン失敗:', err);
  }
})();
