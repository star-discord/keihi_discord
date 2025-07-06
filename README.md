# 💼 Discord 経費申請 Bot

この Bot は Discord 上で経費申請・承認・履歴管理を行うツールです。申請データはローカル JSON に保存され、Google スプレッドシートへの出力にも対応しています。

---

## 🔧 主な機能

- `/経費申請設置`：申請ボタンを生成（モーダル入力）
- `/経費申請履歴`：自分の履歴を年月ごとに確認（スレッド＋スプレッドシート出力）
- `/経費申請設定`：承認ロールと表示ロールを設定（選択式）
- ✅ 承認者がボタンで申請を承認可能（承認進捗が表示に反映）
- 📄 Google スプレッドシート出力に対応

---

## 📁 データ構成

data/
└── keihi/
└── <guildId>/
├── config.json # ギルド設定（承認ロール・表示ロール）
├── spreadsheet_map.json # 年月ごとのスプレッドシート対応表
└── logs/
└── 2025-07.json # 各月の経費申請ログ

---

## 🛠️ セットアップ手順

### 1. リポジトリをクローン

```bash
git clone https://github.com/star-discord/keihi_discord.git
cd keihi_discord

2. 依存パッケージをインストール

npm install

3. 環境変数 .env を作成


DISCORD_TOKEN=あなたのBotトークン
CLIENT_ID=BotのクライアントID
GOOGLE_APPLICATION_CREDENTIALS=credentials.json
BASE_DIR=./data/keihi

4. コマンドを Discord に登録

npm run deploy-commands

5. Bot を起動

npm start

または PM2 を使う場合：

npm run pm2-start

---------------

💬 使用例
📌 経費申請の流れ
管理者が /経費申請設置 を実行

案内メッセージに「経費申請する」ボタンが表示

ユーザーがボタンを押すとモーダル入力（項目・金額・備考）

月別スレッド「経費申請-YYYY-MM」に投稿

チャンネルにも申請内容の通知が送信される

古い案内メッセージは自動削除、最新のみ表示

📜 履歴確認
/経費申請履歴 を実行

年月を選択 → 自分の申請履歴が専用スレッドに表示

同時に Google スプレッドシートにも出力される

🔒 承認機能
管理者が /経費申請設定 を実行

承認ロールを選択（複数可）

対象ユーザーには「承認」ボタンが表示される

ボタン押下で承認者名が追記され、進捗状況が見える化

✅ 必要な権限・前提
Bot に以下の権限が必要です：

メッセージ送信

スレッド作成

メッセージ削除（案内更新時）

Google Cloud Platform（GCP）にて：

Google Sheets API を有効化

サービスアカウントの JSON キーを取得

📜 ライセンス
MIT License
(c) 2025 redstar hr <redstar.hoshir@gmail.com>

🧩 将来の追加予定
📎 領収書画像の添付機能

💰 高額申請のアラート表示

📤 CSV エクスポート

📊 承認済・未承認ステータスの一括管理パネル
