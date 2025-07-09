#!/bin/bash

echo "🚀 経費申請Bot 更新処理開始"

# バックアップ（古いコードを保存）
DATE=$(date '+%Y%m%d_%H%M')
BACKUP_DIR="$HOME/keihi_discord_backup_$DATE"

echo "📁 バックアップ作成: $BACKUP_DIR"
cp -r ~/keihi_discord "$BACKUP_DIR"

# Git Pull（または rsync/scpで最新コードを上書きする場合）
cd ~/keihi_discord || exit
git pull origin main

# PM2 再起動
echo "🔁 PM2再起動"
pm2 restart keihi-bot

# ログ確認（オプション）
pm2 logs --lines 10

echo "✅ 経費申請Bot 更新完了"
