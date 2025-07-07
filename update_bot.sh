echo "📦 Bot 更新処理を開始..."

# PM2 Bot 停止
echo "🛑 Bot 停止..."
pm2 stop 経費申請bot

# 古い Bot ディレクトリ削除
echo "🧹 古い Bot ディレクトリを削除..."
rm -rf ~/keihi_discord_bot

# ZIP 展開
echo "📂 ZIP 解凍..."
unzip -q ~/経費申請bot.zip -d ~/keihi_discord_bot_tmp

# 入れ子解消
mv ~/keihi_discord_bot_tmp/keihi_discord_bot ~/keihi_discord_bot
rm -rf ~/keihi_discord_bot_tmp

# 依存インストール
cd ~/keihi_discord_bot
npm install

# コマンドデプロイ
if [ -f "deploy-commands.js" ]; then
  node deploy-commands.js
else
  echo "⚠️ deploy-commands.js が見つかりません。スキップします。"
fi

# PM2 再起動
echo "🚀 PM2 再起動..."
pm2 start index.js --name 経費申請bot
pm2 save

# 最後に ZIP を削除！
echo "🗑️ ZIP を削除..."
rm -f ~/経費申請bot.zip

echo "✅ Bot 更新完了 🎉"

