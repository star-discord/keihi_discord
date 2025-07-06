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

- \`/経費申請設置\` コマンドで案内メッセージとボタンを送信
- 「経費申請する」ボタンでモーダルフォームを表示
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
      console.error('仕様書表示エラー:', error);
      if (!interaction.replied) {
        await interaction.reply({
          content: '⚠️ エラーが発生しました。もう一度お試しください。',
          ephemeral: true
        });
      }
    }
  }
};
