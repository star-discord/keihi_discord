# 📘 keihi_discord 開発内部ドキュメント

## 📂 リポジトリ情報

- GitHub: [https://github.com/star-discord/keihi_discord](https://github.com/star-discord/keihi_discord)
- 名称：経費申請 Discord Bot
- フォーマット：Node.js / CommonJS（CJS）

---

## 🎯 機能概要

- 経費申請を Discord モーダル + ボタン UI で実施
- 承認ロールを管理者が指定し、申請ごとに承認ログを記録
- 年月ごとの履歴参照機能、スレッド管理
- ローカル `data/<guildId>/<年月>.json` に経費データを保存

---

## 🧱 ディレクトリ構成

```plaintext
keihi_discord/
├── commands/
│   ├── keihi_config.js        # 承認ロール設定
│   ├── keihi_rireki.js        # 経費申請履歴表示
│   ├── keihi_setti.js         # 経費申請ボタン設置（旧 setup.js と統合済み）
│   ├── keihi_spec.js          # Bot仕様書出力
│
├── interactions/
│   ├── buttons/
│   │   ├── approve.js         # 「承認する」ボタンの処理
│   │   └── apply.js           # 「経費申請する」ボタンの処理（モーダル表示）
│   ├── modals/
│   │   └── submit.js          # モーダル送信後の処理
│   ├── selectMenus/
│   │   └── history.js         # 履歴表示用セレクトメニューの処理
│   ├── buttonHandler.js       # （旧）ボタンイベントの集約処理（未使用予定）
│   ├── modalHandler.js        # （旧）モーダルイベントの集約処理（未使用予定）
│   ├── selectMenuHandler.js   # （旧）セレクトメニューイベント（未使用予定）
│
├── events/
│   └── interactionCreate.js   # 各 interaction をボタン・モーダル・セレクトに分配
│
├── utils/
│   └── fileStorage.js         # ローカルJSON保存・読み込み・承認履歴管理
│
├── data/
│   └── <guildId>/
│       ├── 2025-07.json       # 年月別経費ログ
│       └── <guildId>.json     # 設定ファイル（承認ロールなど）
│
├── index.js                   # Bot起動エントリーポイント
├── deploy-commands.js         # スラッシュコマンド登録スクリプト

🛠 使用技術
Node.js v18+

discord.js v14

CommonJS モジュール形式

fs によるローカルJSONファイル管理

PM2 による常駐管理

.env によるトークン管理


🗂 データファイル仕様
1. 設定ファイル（承認ロール）
パス: data/<guildId>/<guildId>.json

json
コピーする
編集する
{
  "approverRoles": ["123456789012345678", "987654321098765432"]
}


2. 経費申請履歴（年月ごと）
パス: data/<guildId>/2025-07.json


[
  {
    "userId": "123456789012345678",
    "username": "user1",
    "content": "交通費：渋谷→新宿",
    "amount": "¥1,000",
    "timestamp": "2025-07-06T12:34:56.789Z",
    "threadMessageId": "112233445566778899",
    "approvedBy": [
      { "userId": "222222222222", "username": "approver1" },
      { "userId": "333333333333", "username": "approver2" }
    ]
  }
]

✅ 現在の仕様
/経費申請設定
└ 承認ロールを管理者が指定可能。RoleSelect にて複数選択。

/経費申請設置
└ 「経費申請する」ボタン＋承認ボタンを含む UI を送信。
└ すでにメッセージがある場合は古い案内を削除して再送信。

/経費申請履歴
└ 年月を引数で指定して履歴表示。スレッドで展開。

経費申請モーダルは apply.js → submit.js の流れ。

申請送信時にスレッドを自動作成。

承認ボタンを押すと approvedBy に保存され、承認状況 (2/3：名前,名前) として表示に反映。

🔄 今後の改善予定
 interactionHandler をボタン/モーダル/セレクトで統一的に動的ロード

 Google スプレッドシート or CSV 出力対応

 Webhook通知オプション（Slackや別チャンネル）

 権限別の UI 表示切替（例：承認者にだけ「承認」ボタン）

🧠 備考
現時点では GCP Storage は使用せず、全てローカル data/ に保存。

ファイルはギルドID単位＋年月単位で自動作成・追記。

PM2 で自動再起動。メモリログは /home/<user>/.pm2/logs/ に出力。

作成日：2025年7月
管理者：@star-discord

