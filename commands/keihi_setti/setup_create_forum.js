// commands/keihi_setti/setup_create_forum.js
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require('discord.js');

module.exports = {
  data: {
    customId: 'setup_create_forum',
  },

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('setup_create_forum_modal')
      .setTitle('経費申請フォーラム本文の入力');

    const bodyInput = new TextInputBuilder()
      .setCustomId('body')
      .setLabel('経費申請フォーラムに表示する本文')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(bodyInput));

    await interaction.showModal(modal);
  },
};
