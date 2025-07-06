// interactions/buttons/cancel.js

const { deleteExpenseEntry } = require('../../utils/fileStorage');
const dayjs = require('dayjs');

module.exports = async function handleCancelButton(interaction) {
  if (!interaction.isButton() || interaction.customId !== 'cancel_button') return;

  try {
    const userId = interaction.user.id;
    const guildId = interaction.guildId;
    const message = interaction.message;
    const messageId = message.id;
    const yearMonth = dayjs().format('YYYY-MM');

    // ✅ ログファイルから申請を取得して、ユーザー本人のものか確認
    const success = deleteExpenseEntry(guildId, yearMonth, messageId);

    if (!success) {
      return interaction.reply({
        content: '❌ この申請は取り消せません（他の人の申請か、ログに存在しません）。',
        ephemeral: true
      });
    }

    // ✅ メッセージを削除
    await message.delete().catch(console.error);

    await interaction.reply({
      content: '🗑️ 経費申請を取り消しました。',
      ephemeral: true
    });

  } catch (err) {
    console.error('❌ 取り消し処理エラー:', err);
    await interaction.reply({
      content: '⚠️ 申請の取り消しに失敗しました。',
      ephemeral: true
    });
  }
};
