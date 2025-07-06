const { deleteExpenseEntry } = require('../../utils/fileStorage');

module.exports = async function handleCancel(interaction) {
  try {
    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const message = interaction.message;

    const thread = message.thread;
    if (!thread) return interaction.reply({ content: '⚠️ スレッドが見つかりません。', ephemeral: true });

    const yearMonth = thread.name.match(/\d{4}-\d{2}/)?.[0];
    if (!yearMonth) return interaction.reply({ content: '⚠️ スレッド名から年月を取得できません。', ephemeral: true });

    const deleted = deleteExpenseEntry(guildId, yearMonth, message.id);
    if (deleted) {
      await message.delete().catch(() => null);
      await interaction.reply({ content: '🗑️ 経費申請を取り消しました。', ephemeral: true });
    } else {
      await interaction.reply({ content: '⚠️ データが見つからなかったため、取り消しできませんでした。', ephemeral: true });
    }
  } catch (err) {
    console.error('❌ 申請取り消しエラー:', err);
    await interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
  }
};


