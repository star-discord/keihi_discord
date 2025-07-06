//expense_apply_button

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
      .setTitle('📋 経費申請フォーム');

    const itemInput = new TextInputBuilder()
      .setCustomId('item')
      .setLabel('申請項目（例：交通費、備品など）')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const amountInput = new TextInputBuilder()
      .setCustomId('amount')
      .setLabel('金額（半角数字のみ）')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const detailInput = new TextInputBuilder()
      .setCustomId('detail')
      .setLabel('用途・詳細（任意）')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false);

    const row1 = new ActionRowBuilder().addComponents(itemInput);
    const row2 = new ActionRowBuilder().addComponents(amountInput);
    const row3 = new ActionRowBuilder().addComponents(detailInput);

    modal.addComponents(row1, row2, row3);

    await interaction.showModal(modal);
  } catch (err) {
    console.error('❌ モーダル表示中にエラーが発生:', err);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: '⚠️ モーダルの表示に失敗しました。',
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: '⚠️ モーダルの表示に失敗しました。',
        ephemeral: true
      });
    }
  }
};
