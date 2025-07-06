const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ChannelType
} = require('discord.js');

const {
  appendExpenseLog,
  getApproverRoles
} = require('../../utils/fileStorage');

module.exports = async function handleModalSubmit(interaction) {
  if (interaction.customId !== 'expense_apply_modal') return;

  try {
    const item = interaction.fields.getTextInputValue('item');
    const amountRaw = interaction.fields.getTextInputValue('amount').replace(/[,¥]/g, '');
    const detail = interaction.fields.getTextInputValue('detail') || '（詳細なし）';

    const amount = parseInt(amountRaw, 10);
    if (isNaN(amount) || amount < 0) {
      return await interaction.reply({
        content: '⛔ 金額は半角の正の数字で入力してください。',
        ephemeral: true
      });
    }

    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const userName = interaction.user.globalName || interaction.user.username;
    const now = new Date();
    const yearMonth = now.toISOString().slice(0, 7); // 例: "2025-07"
    const approverRoles = getApproverRoles(guildId);

    const embed = new EmbedBuilder()
      .setTitle('📄 経費申請')
      .setColor(0x00bfff)
      .addFields(
        { name: '申請者', value: `<@${userId}>`, inline: true },
        { name: '金額', value: `¥${amount.toLocaleString()}`, inline: true },
        { name: '内容', value: item },
        { name: '詳細', value: detail }
      )
      .setFooter({ text: '承認が必要です' })
      .setTimestamp(now);

    const approveButton = new ButtonBuilder()
      .setCustomId('approve_button')
      .setLabel('✅ 承認する')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(approveButton);

    // ✅ 「経費申請-YYYY-MM」スレッドがあるか探す
    const threads = await interaction.channel.threads.fetchActive();
    let targetThread = threads.threads.find(thread => thread.name === `経費申請-${yearMonth}`);

    // ✅ なければ新規作成
    if (!targetThread) {
      const initMessage = await interaction.channel.send({ content: `📂 経費申請スレッドを作成中...` });
      targetThread = await initMessage.startThread({
        name: `経費申請-${yearMonth}`,
        autoArchiveDuration: 1440
      });
    }

    // ✅ 申請メッセージ送信
    const sentMessage = await targetThread.send({
      content: '📝 以下の内容で申請されました：',
      embeds: [embed],
      components: [row]
    });

    // ✅ ログ保存
    appendExpenseLog(guildId, yearMonth, {
      userId,
      userName,
      item,
      amount,
      detail,
      timestamp: now.toISOString(),
      threadMessageId: sentMessage.id,
      approvedBy: []
    });

    await interaction.reply({
      content: '✅ 経費申請を受け付けました。',
      ephemeral: true
    });

  } catch (err) {
    console.error('❌ モーダル送信処理エラー:', err);
    await interaction.reply({
      content: '⚠️ 経費申請の送信中にエラーが発生しました。',
      ephemeral: true
    });
  }
};
