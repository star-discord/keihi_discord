// commands/keihi_setti/cancel.js

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const { deleteExpenseEntry, getExpenseEntries } = require('../../utils/fileStorage.js');
const dayjs = require('dayjs');

module.exports = async function handleCancelButton(interaction) {
  if (!interaction.isButton() || interaction.customId !== 'cancel_button') return;

  try {
    const userId = interaction.user.id;
    const username = interaction.user.globalName || interaction.user.username;
    const guildId = interaction.guildId;
    const message = interaction.message;
    const messageId = message.id;
    const createdAt = message.createdAt;
    const yearMonth = dayjs(createdAt).format('YYYY-MM');

    // ログファイルから該当データ取得
    const entries = getExpenseEntries(guildId, yearMonth);
    const entry = entries.find(e => e.threadMessageId === messageId);

    if (!entry || entry.userId !== userId) {
      return interaction.reply({
        content: '❌ この申請は取り消せません（他の人の申請か、ログに存在しません）。',
        ephemeral: true
      });
    }

    // データベース（JSON）から削除
    const success = deleteExpenseEntry(guildId, yearMonth, messageId);

    if (!success) {
      return interaction.reply({
        content: '❌ ログの削除に失敗しました。',
        ephemeral: true
      });
    }

    // 元メッセージ（スレッド側）に取り消し表記を追加
    const originalEmbed = message.embeds?.[0];
    const updatedEmbed = EmbedBuilder.from(originalEmbed)
      .setTitle(`${originalEmbed.title || '📄 経費申請'} [取り消し済]`)
      .setColor(0xAAAAAA);

    await message.edit({
      content: '🗑️ ~~以下の内容で申請されました：~~（取り消されました）',
      embeds: [updatedEmbed],
      components: [] // 承認・取り消しボタン削除
    });

    // 申請元のチャンネルにログ送信
    const cancelLog = new EmbedBuilder()
      .setTitle('🗑️ 経費申請が取り消されました')
      .addFields(
        { name: '取り消しユーザー', value: `<@${userId}>`, inline: true },
        { name: '取り消し時間', value: dayjs().format('YYYY-MM-DD HH:mm'), inline: true },
        { name: '項目', value: entry.item },
        { name: '金額', value: `¥${entry.amount.toLocaleString()}` },
        { name: '詳細', value: entry.detail }
      )
      .setColor(0xAAAAAA)
      .setTimestamp();

    await interaction.channel.send({ embeds: [cancelLog] });

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