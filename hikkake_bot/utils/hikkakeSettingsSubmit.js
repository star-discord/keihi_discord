// hikkake_bot/utils/hikkakeSettingsSubmit.js

// This is a placeholder for now. A full implementation would save the settings to GCS.
// const { readState, writeState } = require('./hikkakeStateManager');

module.exports = {
  customId: 'hikkake_settings_submit',
  async handle(interaction) {
    try {
      const newResponseText = interaction.fields.getTextInputValue('response_text_input');

      // In a real implementation, you would save this to state:
      // const state = await readState(interaction.guildId);
      // state.hikkakeSettings.responseText = newResponseText;
      // await writeState(interaction.guildId, state);

      await interaction.reply({
        content: `✅ 反応文を「${newResponseText}」に設定しました。`,
        flags: 64, // 64 is MessageFlags.Ephemeral
      });
    } catch (error) {
      console.error('[hikkakeSettingsSubmit] 設定保存エラー:', error);
      throw error; // Let the global handler reply to the user
    }
  },
};