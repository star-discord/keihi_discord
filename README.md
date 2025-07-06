# 💼 Discord 経費申請 Bot

この Bot は Discord 上で経費申請・承認・履歴管理を行うツールです。申請データはローカル JSON で保存され、Google スプレッドシートへの出力も可能です。

---

## 🔧 主な機能

- `/経費申請設置`：申請ボタンを生成（モーダル式）
- `/経費申請履歴`：自分の履歴を年月で確認（スレッド＋スプレッドシート出力）
- `/経費申請設定 承認ロール`：承認者ロールを登録
- ✅ 承認者がボタンで申請を承認可能
- 📄 Google スプレッドシート出力機能付き

---

## 📁 データ構成

- ローカル保存：`data/<guildId>/<年月>.json`
- 承認ロール設定：`data/<guildId>/<guildId>.json`
- スプレッドシート対応：`spreadsheet_map.json`

---

## 🛠️ セットアップ手順

### 1. リポジトリをクローン

```bash
git clone https://github.com/star-discord/keihi_discord.git
cd keihi_discord
```

### 2. 依存パッケージをインストール

```bash
npm install
```

### 3. 環境変数 `.env` を作成

```env
DISCORD_TOKEN=あなたのBotトークン
DISCORD_CLIENT_ID=BotのクライアントID
GOOGLE_APPLICATION_CREDENTIALS=credentials.json
```

> `credentials.json` は GCP で取得したサービスアカウントキーです（Google Sheets API を有効化してください）

### 4. コマンドを Discord に登録

```bash
npm run deploy-commands
```

### 5. Bot を起動

```bash
npm start
```

または PM2 を使う場合：

```bash
npm run pm2-start
```

---

## 💬 使用例

### 📌 経費申請

- `/経費申請設置` → ボタンから申請
- モーダル入力：項目・金額・備考

### 📜 履歴確認

- `/経費申請履歴` → 年月選択 → スレッド + スプレッドシート出力

### 🔒 承認機能

- 承認ロールを `/経費申請設定 承認ロール` で設定
- 申請メッセージに「承認ボタン」→ 承認者が押下すると名前が追記

---

## ✅ 必要な権限・設定

- Bot にメッセージ送信・スレッド作成権限が必要です
- GCP 側の認証設定が正しく行われている必要があります

---

## 📜 ライセンス

MIT License  
(c) 2025 redstar hr <<redstar.hoshir@gmail.com>>

---

## 🧩 将来の追加予定（例）

- 画像添付による領収書提出
- 金額フィルタ・未承認一覧出力
- 管理者向け CSV エクスポート
