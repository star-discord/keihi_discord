# star-chat-gpt-discord-bot

Discordで動作するChatGPT連携Botです。  
Google Cloud Storageを利用して設定ファイルを永続化します。

---

## 機能概要

- `/star_chat_gpt設定`  
  管理者がChatGPTが反応するテキストチャンネルを指定します。

- `/star_chat_gpt設置`  
  管理者が指定したチャンネルに「今日のChatGPT」ボタン付き案内メッセージを設置します。  
  既存の案内メッセージは自動で削除されます。

- ボタン「今日のChatGPT」を押すと、  
  - 今日の東京の天気  
  - 最近のニュース  
  - 面白い豆知識  
  がChatGPTから生成されて返信されます。

---

## 環境構築

### 必須環境

- Node.js 18.x 以上
- Discord Bot トークン
- Google Cloud プロジェクト
- Google Cloud Storage バケット

---

### 環境変数設定

`.env` ファイルなどで以下を設定してください。

```env
DISCORD_TOKEN=（Discord Botトークン）
CLIENT_ID=（DiscordアプリケーションID）
GOOGLE_SERVICE_ACCOUNT_EMAIL=（サービスアカウントのメールアドレス）
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n（改行は \n で）-----END PRIVATE KEY-----\n"
PORT=3000
BUCKET_NAME=star-chat-gpt-discord-bot
OPENAI_API_KEY=（OpenAI APIキー）
