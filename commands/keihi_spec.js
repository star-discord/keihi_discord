const { SlashCommandBuilder } = require('discord.js');

// 📄 Bot の機能概要・仕様説明
const specText = `
>>> 📄 **経費申請Bot 仕様書**

---

### 🧾 概要
このBotは、**Discord上で簡単に経費申請を行うためのツール**です。  
モーダルフォームによる申請と、スレッド管理による記録・共有が特徴です。

---

### ✅ 主な機能

- \`/経費申請設置\` でボタン付き案内メッセージを送信
- 「経費申請する」ボタンでモーダルを開く
- 「経費項目・金額・備考」を入力して送信
- 月別スレッド「経費申請-YYYY-MM」に投稿
- 必要に応じて承認ボタンを使用
- チャンネルに申請通知（申請者・日付・スレッドリンク）を自動投稿

---

### 🔁 操作フロー

1. 管理者が \`/経費申請設置\` を実行
2. ボタン付き案内メッセージが表示される
3. ユーザーがボタンを押してモーダル入力
4. 送信後、スレッドに申請メッセージが記録される
5. 申請はボタンで承認可能（ロール権限による制限あり）

---

🔧 開発・運用：**redstar hr**  
📧 お問い合わせ：redstar.hoshir@gmail.com
`;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('経費申請bot仕様書')
    .setDescription('経費申請Botの仕様書を表示します'),

  async execute(interaction) {
    try {
      await interaction.reply({ content: specText, ephemeral: true });
    } catch (error) {
      console.error('❌ 仕様書表示エラー:', error);
      if (!interaction.replied) {
        await interaction.reply({
          content: '⚠️ エラーが発生しました。もう一度お試しください。',
          ephemeral: true
        });
      }
    }
  }
};
