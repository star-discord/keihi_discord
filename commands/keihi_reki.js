const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('経費申請履歴')
    .setDescription('自分の経費申請履歴を確認します（モーダル入力）'),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('expense_history_modal')
      .setTitle('経費申請履歴の確認');

    const yearMonthInput = new TextInputBuilder()
      .setCustomId('yearMonth')
      .setLabel('対象の年月または年月日 (例: 2025-07 または 2025-07-05)')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(yearMonthInput)
    );

    await interaction.showModal(modal);
  }
};
