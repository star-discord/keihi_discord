#!/bin/bash

BOT_NAME="chat_gpt_bot"
WORK_DIR="/home/star_vesta_legion_kanri/chat_gpt_bot/chat_gpt_bot"

cd "$WORK_DIR"
echo "📦 最新コードを反映中..."
git pull origin main

if [ -f package.json ]; then
  echo "📦 npm install 実行中..."
  npm install
fi

echo "🚀 PM2でBot再起動中..."
pm2 restart "$BOT_NAME"
echo "💾 PM2設定保存中..."
pm2 save

echo "✅ 更新完了: $BOT_NAME"