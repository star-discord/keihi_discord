const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require('discord.js');

module.exports = async function handleApplyButton(interaction) {
  try {
    const modal = new ModalBuilder()
      .setCustomId('expense_apply_modal')
      .setTitle('経費申請フォーム');

    const itemInput = new TextInputBuilder()
      .setCustomId('item')
      .setLabel('申請内容')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const amountInput = new TextInputBuilder()
      .setCustomId('amount')
      .setLabel('金額（例：30000）')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const detailInput = new TextInputBuilder()
      .setCustomId('detail')
      .setLabel('詳細・用途（任意）')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false);

    const row1 = new ActionRowBuilder().addComponents(itemInput);
    const row2 = new ActionRowBuilder().addComponents(amountInput);
    const row3 = new ActionRowBuilder().addComponents(detailInput);

    await interaction.showModal(modal.addComponents(row1, row2, row3));
  } catch (err) {
    console.error('❌ 経費申請モーダル表示エラー:', err);
    await interaction.reply({
      content: 'モーダルの表示に失敗しました。',
      ephemeral: true
    });
  }
};


