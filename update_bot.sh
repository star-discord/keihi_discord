#!/bin/bash

# === 設定項目 ===
REMOTE_USER="test"
REMOTE_HOST="keihi-discord-bot"
REMOTE_PATH="/home/test/keihi_discord"
ZONE="asia-northeast1-a"
FILES_TO_SEND=("index.js" "package.json" "commands" "events" "utils" ".env" "deploy-commands.js")

echo "[1/5] Botを停止中..."
gcloud compute ssh ${REMOTE_USER}@${REMOTE_HOST} --zone=${ZONE} --command="pm2 stop keihi-bot"

echo "[2/5] ファイルを転送中..."
for FILE in "${FILES_TO_SEND[@]}"; do
  echo " - $FILE を送信"
  gcloud compute scp --recurse "$FILE" ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH} --zone=${ZONE}
done

echo "[3/5] Discordスラッシュコマンドを更新中..."
gcloud compute ssh ${REMOTE_USER}@${REMOTE_HOST} --zone=${ZONE} --command="cd ${REMOTE_PATH} && node deploy-commands.js"

echo "[4/5] Botを再起動中..."
gcloud compute ssh ${REMOTE_USER}@${REMOTE_HOST} --zone=${ZONE} --command="pm2 restart keihi-bot"

echo "[5/5] PM2 状態保存中..."
gcloud compute ssh ${REMOTE_USER}@${REMOTE_HOST} --zone=${ZONE} --command="pm2 save"

echo "✅ Bot更新完了！"
