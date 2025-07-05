#!/bin/bash

echo "📦 Bot 更新処理を開始..."

# PM2 Bot 停止
echo "🛑 Bot 停止..."
pm2 stop chat_gpt_bot

# 古い Bot フォルダ削除
echo "🧹 古いフォルダ削除..."
rm -rf ~/chat_gpt_bot

# ZIP 解凍（中間ディレクトリに一旦展開）
echo "📂 ZIP 解凍..."
unzip -q ~/chat_gpt_bot.zip -d ~/chat_gpt_bot_tmp

# chat_gpt_bot フォルダが入れ子になっているのを修正
mv ~/chat_gpt_bot_tmp/chat_gpt_bot ~/chat_gpt_bot
rm -rf ~/chat_gpt_bot_tmp

# ZIP 削除
echo "🗑️ ZIP 削除..."
rm -f ~/chat_gpt_bot.zip

# コマンド再デプロイ & 依存パッケージのインストール
echo "📡 コマンド再デプロイ & 依存パッケージインストール..."
cd ~/chat_gpt_bot

# package.json 存在チェック
if [ ! -f "package.json" ]; then
  echo "❌ package.json が見つかりません。"
  exit 1
fi

# npm install
npm install

# deploy-commands.js 実行
if [ -f "deploy-commands.js" ]; then
  node deploy-commands.js
else
  echo "⚠️ deploy-commands.js が見つかりません。スキップします。"
fi

# PM2 再起動
echo "🚀 PM2 再起動..."
pm2 start index.js --name chat_gpt_bot
pm2 save

echo "✅ Bot 更新完了 🎉"

