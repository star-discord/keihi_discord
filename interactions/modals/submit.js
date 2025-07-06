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
    const amount = interaction.fields.getTextInputValue('amount');
    const detail = interaction.fields.getTextInputValue('detail') || '（詳細なし）';

    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const userName = interaction.user.username;
    const now = new Date();
    const yearMonth = now.toISOString().slice(0, 7);
    const approverRoles = getApproverRoles(guildId);

    // ✅ Embed 作成
    const embed = new EmbedBuilder()
      .setTitle('📄 経費申請')
      .setColor(0x00bfff)
      .addFields(
        { name: '申請者', value: `<@${userId}>`, inline: true },
        { name: '金額', value: `¥${amount}`, inline: true },
        { name: '内容', value: item },
        { name: '詳細', value: detail }
      )
      .setFooter({ text: '承認が必要です' })
      .setTimestamp(now);

    // ✅ 承認ボタン
    const approveButton = new ButtonBuilder()
      .setCustomId('approve_button')
      .setLabel('✅ 承認する')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(approveButton);

    // ✅ 元の申請ボタンメッセージを削除（直前の bot メッセージ）
    const messages = await interaction.channel.messages.fetch({ limit: 20 });
    const botMessages = messages.filter(msg =>
      msg.author.id === interaction.client.user.id &&
      msg.components?.[0]?.components?.some(btn => btn.customId === 'expense_apply_button')
    );

    for (const msg of botMessages.values()) {
      await msg.delete().catch(() => {});
    }

    // ✅ 新しい申請メッセージを送信し、スレッドも作成
    const sentMessage = await interaction.channel.send({
      content: '📝 以下の内容で申請されました：',
      embeds: [embed],
      components: [row]
    });

    const thread = await sentMessage.startThread({
      name: `申請者-${userName}`,
      autoArchiveDuration: 1440
    });

    // ✅ 経費ログに保存
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
