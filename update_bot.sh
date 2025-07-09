#!/bin/bash

echo "📦 Bot更新開始"

# 停止
pm2 stop ecosystem.config.cjs

# data バックアップ
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
cp -r ~/keihi_discord/data ~/data_backup_$TIMESTAMP
echo "✅ data バックアップ: data_backup_$TIMESTAMP"

# ZIP 解凍 & 上書き
unzip -o ~/経費申請bot.zip -d ~
rm -rf ~/keihi_discord
mv ~/経費申請bot ~/keihi_discord
cp -r ~/data_backup_$TIMESTAMP ~/keihi_discord/data

# 再構築
cd ~/keihi_discord
npm install
pm2 start ecosystem.config.cjs
pm2 save

echo "✅ Bot更新完了"

