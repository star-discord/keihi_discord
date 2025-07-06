const { ChannelType } = require('discord.js');
const { getExpenseEntries } = require('../../utils/fileStorage');

module.exports = async function handleHistorySelect(interaction) {
  if (interaction.customId !== 'history_year_month') return;

  const guildId = interaction.guildId;
  const userId = interaction.user.id;
  const yearMonth = interaction.values[0];

  try {
    // ✅ 履歴データ取得（そのユーザーの分のみ）
    const entries = getExpenseEntries(guildId, yearMonth, userId);

    if (!entries.length) {
      return interaction.reply({
        content: `📂 ${yearMonth} に申請された履歴は見つかりませんでした。`,
        ephemeral: true
      });
    }

    // ✅ スレッドを生成して履歴投稿
    const thread = await interaction.channel.threads.create({
      name: `${yearMonth}の経費申請履歴 - ${interaction.user.username}`,
      autoArchiveDuration: 1440,
      type: ChannelType.PrivateThread
    });

    for (const entry of entries) {
      const approvers = entry.approvedBy?.length
        ? `✅ 承認済 (${entry.approvedBy.length})：${entry.approvedBy.map(a => a.username).join(', ')}`
        : '❌ 未承認';

      await thread.send({
        content: `📌 **${entry.item}**（¥${entry.amount}）\n🗓️ ${entry.timestamp}\n📝 ${entry.detail}\n${approvers}`
      });
    }

    await interaction.reply({
      content: `✅ ${yearMonth} の履歴を表示しました（スレッド参照）。`,
      ephemeral: true
    });

  } catch (err) {
    console.error('❌ 履歴表示エラー:', err);
    await interaction.reply({
      content: '⚠️ 履歴表示中にエラーが発生しました。',
      ephemeral: true
    });
  }
};
