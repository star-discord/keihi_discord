#!/bin/bash

echo "🔧 GCPインスタンス初期化開始"

# Node.js & npm & PM2
echo "📦 Node.js + PM2 をインストール"
sudo apt update
sudo apt install -y nodejs npm git
sudo npm install -g pm2

# nvm 経由で Node.js 推奨版をインストールする場合（任意）
# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# source ~/.nvm/nvm.sh
# nvm install 18
# nvm use 18

# Botディレクトリに移動
cd ~/keihi_discord || exit

# パッケージインストール
npm install

# .env がない場合は例から生成
if [ ! -f .env ]; then
  cp .env.example .env
  echo "⚠️ .env を作成しました。中身を編集してください。"
fi

# PM2 に登録
pm2 start index.js --name keihi-bot
pm2 save

echo "✅ 初期化完了 & Bot 起動済み"
