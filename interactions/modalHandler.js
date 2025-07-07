// interactions/modalHandler.js
const { getApproverRoles } = require('../utils/fileStorage.js');
const handleSubmit = require('./modals/submit.js');

module.exports = async function handleModal(interaction) {
  try {
    // 現在対応しているモーダルID
    if (interaction.customId === 'expense_apply_modal') {
      return await handleSubmit(interaction);
    }

    // 対応していないモーダルIDが来たときのログ
    console.warn(`⚠️ 未対応のモーダルID: ${interaction.customId}`);
    return await interaction.reply({
      content: '⚠️ 未対応のモーダルです。',
      ephemeral: true
    });

  } catch (err) {
    console.error('❌ モーダル処理エラー:', err);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: '⚠️ モーダルの処理中にエラーが発生しました。',
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: '⚠️ モーダルの処理中にエラーが発生しました。',
        ephemeral: true
      });
    }
  }
};

