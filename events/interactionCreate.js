// events/interactionCreate.js
const handleButton = require('../interactions/buttonHandler');
const handleModal = require('../interactions/modalHandler');
const handleSelectMenu = require('../interactions/selectMenuHandler');

function timestamp() {
  return new Date().toISOString();
}

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      const userTag = interaction.user?.tag ?? '不明ユーザー';

      if (interaction.isChatInputCommand()) {
        console.log(`[${timestamp()}] 🟢 [Command] ${interaction.commandName} by ${userTag}`);
        const command = client.commands.get(interaction.commandName);
        if (!command) {
          console.warn(`[${timestamp()}] ⚠️ コマンドが見つかりません: ${interaction.commandName}`);
          return;
        }
        return await command.execute(interaction, client);
      }

      if (interaction.isButton()) {
        console.log(`[${timestamp()}] 🔘 [Button] ${interaction.customId} by ${userTag}`);
        return handleButton(interaction, client);
      }

      if (interaction.isModalSubmit()) {
        console.log(`[${timestamp()}] 📝 [Modal] ${interaction.customId} by ${userTag}`);
        return handleModal(interaction, client);
      }

      if (interaction.isStringSelectMenu()) {
        console.log(`[${timestamp()}] 📑 [SelectMenu] ${interaction.customId} by ${userTag}`);
        return handleSelectMenu(interaction, client);
      }

      console.log(`[${timestamp()}] ❔ [Unknown Interaction] type=${interaction.type} by ${userTag}`);

    } catch (err) {
      console.error(`[${timestamp()}] ❌ interactionCreate エラー:`, err);

      try {
        const replyContent = { content: '⚠️ エラーが発生しました。', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(replyContent);
        } else {
          await interaction.reply(replyContent);
        }
      } catch (e) {
        console.error(`[${timestamp()}] ⚠️ エラーレスポンス送信に失敗:`, e);
      }
    }
  }
};
