# STAR ChatGPT Discord Bot

Discord上でChatGPTと自然に会話できる **STAR 管理Bot** です。  
`@bot名` で話しかけると応答し、スラッシュコマンドで動作設定が可能です。

## 🛠 機能概要

- `@bot名` によるメンション応答（OpenAI GPT-4 使用）
- スラッシュコマンドでトリガー単語の設定が可能
- `.env` による柔軟な設定
- `PM2` によるプロセスマネジメント・永続起動対応
- `update_bot.sh` による自動デプロイスクリプト
- Discord Slash Command に完全対応

---

## 📦 セットアップ手順

### 1. 必要なもの

- Node.js (v18以上)
- Discord Bot のトークンと Client ID
- OpenAI API キー（`https://platform.openai.com/`）

### 2. 初期構築

```bash
git clone https://github.com/star-discord/chat_gpt_bot.git
cd chat_gpt_bot/chat_gpt_bot

npm install
cp .env.example .env  # 必要に応じて自作
