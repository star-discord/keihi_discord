// history_year_month.js

const { ChannelType } = require('discord.js');
const { getExpenseEntries } = require('../../utils/fileStorage.js');

module.exports = async function handleHistorySelect(interaction) {
  if (interaction.customId !== 'history_year_month') return;

  const guildId = interaction.guildId;
  const userId = interaction.user.id;
  const yearMonth = interaction.values[0];

  try {
    // 対象ユーザーの履歴取得
    const entries = getExpenseEntries(guildId, yearMonth, userId);

    // 履歴が見つからない場合
    if (!entries || !entries.length) {
      return interaction.reply({
        content: `📂 ${yearMonth} に申請された経費履歴は見つかりませんでした。`,
        ephemeral: true
      });
    }

    // プライベートスレッド作成
    const thread = await interaction.channel.threads.create({
      name: `${yearMonth}の経費申請履歴 - ${interaction.user.username}`,
      autoArchiveDuration: 1440,  // 24時間でアーカイブ
      type: ChannelType.PrivateThread
    });

    // 履歴ごとにメッセージを送信
    for (const entry of entries) {
      const approverText = entry.approvedBy?.length
        ? `✅ 承認 (${entry.approvedBy.length})：${entry.approvedBy.map(a => a.username).join(', ')}`
        : '❌ 未承認';

      const formattedAmount = entry.amount?.toLocaleString() ?? entry.amount ?? 'N/A';
      const formattedTimestamp = entry.timestamp ?? '日時不明';
      const formattedItem = entry.item ?? '（不明）';
      const formattedDetail = entry.detail ?? '（詳細なし）';

      await thread.send({
        content: `📌 **${formattedItem}**（¥${formattedAmount}）\n🗓️ ${formattedTimestamp}\n📝 ${formattedDetail}\n${approverText}`
      });
    }

    // 最後に履歴が表示されたことを通知
    await interaction.reply({
      content: `✅ ${yearMonth} の経費申請履歴を表示しました。スレッド内で詳細を確認できます。`,
      ephemeral: true
    });

  } catch (err) {
    console.error('❌ 履歴表示中にエラーが発生しました:', err);
    await interaction.reply({
      content: '⚠️ 履歴表示中にエラーが発生しました。後ほど再試行してください。',
      ephemeral: true
    });
  }
};

