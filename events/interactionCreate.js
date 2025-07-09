// index.js
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
require('dotenv').config();

const { ensureDataFolder, backupDataFiles } = require('./utils/initUtils.js');

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

// ✅ コマンド読み込み（再帰対応）
function loadCommands(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      loadCommands(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      try {
        const command = require(fullPath);
        const commandName = command.data?.name || path.parse(entry.name).name;

        if (command.data && typeof command.execute === 'function') {
          if (client.commands.has(commandName)) {
            console.warn(`⚠️ [index] コマンド上書き警告: ${commandName}`);
          }
          client.commands.set(commandName, command);
          console.log(`✅ [index] コマンド読込成功: ${commandName}（${fullPath}）`);
        } else {
          console.warn(`⚠️ [index] 無効なコマンド形式: ${fullPath}`);
        }
      } catch (err) {
        console.error(`❌ [index] 読み込み失敗: ${fullPath}`, err);
      }
    }
  }
}

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

  const commandsPath = path.join(__dirname, 'commands');
  const eventsPath = path.join(__dirname, 'events');

  loadCommands(commandsPath);
  loadEvents(eventsPath);

  console.log(`📦 登録されたスラッシュコマンド数: ${client.commands.size}`);

  // ✅ data/ のバックアップを作成
  backupDataFiles();

  try {
    await client.login(process.env.DISCORD_TOKEN);
    console.log('✅ Discordログイン成功');

    // ✅ ログイン後の初期設定
    client.once('ready', () => {
      client.user.setStatus('online'); // ステータス: オンライン
      client.user.setActivity('経費申請を監視中', { type: 'WATCHING' }); // アクティビティ

      client.guilds.cache.forEach(guild => {
        ensureDataFolder(guild.id); // data/<guildId> を自動作成

        const me = guild.members.me;
        if (me && me.manageable) {
          me.setNickname('STAR管理bot').catch(() => {}); // ニックネーム変更（任意）
        }
      });

      console.log(`🟢 Botとしてログイン完了: ${client.user.tag}`);
    });

  } catch (err) {
    console.error('❌ Discordログイン失敗:', err);
  }
})();
