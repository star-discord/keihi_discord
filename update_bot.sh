#!/bin/bash

echo "🚀 経費申請Bot 更新処理開始"

# バックアップ
DATE=$(date '+%Y%m%d_%H%M')
BACKUP_DIR="$HOME/keihi_discord_backup_$DATE"
echo "📁 バックアップ作成: $BACKUP_DIR"
cp -r ~/keihi_discord "$BACKUP_DIR"

# 更新処理
cd ~/keihi_discord || exit 1

echo "🔄 Git Pull 実行"
git pull origin main || {
  echo "❌ git pull 失敗。処理を中止します。"
  exit 1
}

echo "📦 npm install 実行"
npm install

# スラッシュコマンド デプロイ
echo "📡 スラッシュコマンドをデプロイ中..."
node deploy-commands.js || {
  echo "❌ スラッシュコマンドのデプロイに失敗しました。"
  exit 1
}

# PM2 再起動
echo "🔁 PM2 再起動"
pm2 restart keihi-bot
pm2 save

# ログ確認
echo "📄 最新ログ"
pm2 logs --lines 10

echo "✅ 経費申請Bot 更新完了"
