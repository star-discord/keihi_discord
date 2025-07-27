// hikkake_bot/utils/hikkake_modal_handler.js

const settingsSubmitHandler = require('./hikkakeSettingsSubmit');

const handlers = [
  settingsSubmitHandler,
  // If other hikkake modals are added in the future, import and add them here.
];

module.exports = {
  /**
   * @param {import('discord.js').ModalSubmitInteraction} interaction
   * @returns {Promise<boolean>}
   */
  async execute(interaction) {
    if (!interaction.isModalSubmit() || !interaction.customId.startsWith('hikkake_')) return false;

    for (const handler of handlers) {
      // Use .customId for string or .test() for regex
      if (typeof handler.customId === 'string' && handler.customId === interaction.customId) {
        await handler.handle(interaction);
        return true;
      }
      if (handler.customId instanceof RegExp && handler.customId.test(interaction.customId)) {
        await handler.handle(interaction);
        return true;
      }
    }
    return false;
  }
};