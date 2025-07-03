// index.js
import http from 'http';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

dotenv.config();

const port = process.env.PORT || 3000;

// Render向けHTTPサーバ起動（ヘルスチェック用）
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is running');
});
server.listen(port, () => {
  console.log(`HTTP server listening on port ${port}`);
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// コマンドを格納するCollectionを用意
client.commands = new Collection();

(async () => {
  try {
    // commandsフォルダ内のコマンドファイルをすべて読み込み
    const commandsPath = path.resolve('./commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      try {
        const filePath = path.join(commandsPath, file);
        const commandModule = await import(pathToFileURL(filePath).href);
        const command = commandModule.default ?? commandModule;
        if (command.data && command.execute) {
          client.commands.set(command.data.name, command);
          console.log(`✅ コマンド読み込み成功: ${file}`);
        } else {
          console.warn(`⚠️ コマンド形式不正: ${file}`);
        }
      } catch (cmdErr) {
        console.error(`❌ コマンド読み込み失敗: ${file}`, cmdErr);
      }
    }

    // eventsフォルダ内のイベントファイルをすべて読み込み
    const eventsPath = path.resolve('./events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
      try {
        const filePath = path.join(eventsPath, file);
        const eventModule = await import(pathToFileURL(filePath).href);
        const event = eventModule.default ?? eventModule;
        if (!event || !event.name || !event.execute) {
          console.warn(`⚠️ イベント形式不正: ${file}`);
          continue;
        }
        if (event.once) {
          client.once(event.name, (...args) => {
            try {
              event.execute(...args);
            } catch (e) {
              console.error(`イベント処理エラー（once）: ${event.name}`, e);
            }
          });
        } else {
          client.on(event.name, (...args) => {
            try {
              event.execute(...args);
            } catch (e) {
              console.error(`イベント処理エラー: ${event.name}`, e);
            }
          });
        }
        console.log(`✅ イベント読み込み成功: ${file}`);
      } catch (eventErr) {
        console.error(`❌ イベント読み込み失敗: ${file}`, eventErr);
      }
    }

    // Discordにログイン
    try {
      await client.login(process.env.DISCORD_TOKEN);
      console.log('Discord client logged in successfully.');
    } catch (loginErr) {
      console.error('Discord client login失敗:', loginErr);
      process.exit(1); // ログイン失敗時はプロセス終了も検討
    }

  } catch (err) {
    console.error('初期ロードエラー:', err);
    process.exit(1);
  }
})();

// 未処理例外のグローバルキャッチ
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception thrown:', error);
  // 必要ならプロセス終了も
  // process.exit(1);
});

