#!/bin/bash

echo "🚀 Bot起動処理開始"

# data存在チェック
if [ ! -d ~/keihi_discord/data ]; then
  echo "⚠️ data フォルダが見つかりません。空のフォルダを作成します"
  mkdir -p ~/keihi_discord/data
else
  # 自動バックアップ
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  cp -r ~/keihi_discord/data ~/data_backup_$TIMESTAMP
  echo "📂 data をバックアップしました: ~/data_backup_$TIMESTAMP"
fi

# 起動
cd ~/keihi_discord
npm install
pm2 start ecosystem.config.cjs
pm2 save

echo "✅ Bot起動完了"
