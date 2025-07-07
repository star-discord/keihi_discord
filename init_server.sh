#!/bin/bash

echo "🛠️ Google Cloud インスタンス初期構築 開始..."

# 1. パッケージ更新
echo "🔄 パッケージ更新..."
sudo apt update -y && sudo apt upgrade -y

# 2. 基本ツールインストール
echo "📦 必須パッケージをインストール中..."
sudo apt install -y curl git unzip build-essential

# 3. Node.js 18.x をインストール
if ! command -v node >/dev/null; then
  echo "⬇️ Node.js をインストール中..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt install -y nodejs
fi

# 4. PM2 インストール
if ! command -v pm2 >/dev/null; then
  echo "📦 pm2 をグローバルインストール中..."
  sudo npm install -g pm2
fi

# 5. 完了表示
echo "✅ 初期サーバーセットアップ完了 🎉"
echo "👉 次は chat_gpt_bot.zip をアップロードし、update_bot.sh を実行してください。"
