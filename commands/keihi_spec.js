import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('経費申請bot仕様書') // コマンド名変更（日本語OK）
  .setDescription('経費申請Botの仕様書を表示します');

const specText = `
>>> **📄 経費申請Bot 仕様書**

---

### 🧾 概要
このBotは、**Discord上で簡単に経費申請を行うためのツール**です。  
モーダルフォームによる申請と、スレッド管理による記録・共有が特徴です。

---

### ✅ 主な機能

- \`/経費申請設置\` コマンドで案内メッセージとボタンを送信
- 「経費申請する」ボタンでモーダルフォーム表示
- 「経費項目・金額・備考」を入力して送信
- 月別スレッド「経費申請-YYYY-MM」に投稿
- テキストチャンネルに申請通知（日時・名前・メンション・スレッドリンク）

---

### 🔁 操作フロー

1. 管理者等が \`/経費申請設置\` を実行
2. ボタン付き案内メッセージが表示される
3. ユーザーがボタンを押すとモーダルが表示
4. 経費項目・金額・備考を入力し送信
5. スレッドとチャンネルに内容が投稿される
6. 最新の案内メッセージが自動再表示（古い案内は削除）

---

### 📌 補足仕様

- スレッド名：「\`経費申請-YYYY-MM\`」で月単位に統一
- 複数ユーザーの申請も同スレッドにまとめる
- @メンションはユーザーIDで常に有効
- 備考欄は任意入力（未入力時は「（備考なし）」と表示）
- モーダルは Discord.js v14 API を使用
- Render や Cloud Run 対応、常時稼働

---

🔧 開発・運用：**redstar hr**  
📧 お問い合わせ：redstar.hoshir@gmail.com
`;

export async function execute(interaction) {
  try {
    await interaction.reply({
      content: specText,
      ephemeral: true, // 非公開返信
    });
  } catch (error) {
    console.error('仕様書表示エラー:', error);
    if (!interaction.replied) {
      await interaction.reply({
        content: 'エラーが発生しました。',
        ephemeral: true,
      });
    }
  }
}
