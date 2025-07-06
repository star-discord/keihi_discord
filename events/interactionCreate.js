const { Events } = require('discord.js');
const handleButton = require('../interactions/buttonHandler');
const handleModal = require('../interactions/modalHandler');
const handleSelectMenu = require('../interactions/selectMenuHandler');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    try {
      if (interaction.isButton()) {
        return handleButton(interaction);
      }

      if (interaction.isModalSubmit()) {
        return handleModal(interaction);
      }

      if (interaction.isStringSelectMenu()) {
        return handleSelectMenu(interaction);
      }
    } catch (err) {
      console.error('❌ interactionCreate エラー:', err);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'エラーが発生しました。', ephemeral: true });
      } else {
        await interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
      }
    }
  }
};
