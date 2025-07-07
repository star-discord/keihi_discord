// modalHandler.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getApproverRoles } = require('../utils/fileStorage');
const MESSAGES = require('../constants/messages');

module.exports = async function handleModal(interaction) {
  try {
    const customId = interaction.customId;

    // モーダルで送信された内容を取得
    const modalData = interaction.fields.getTextInputValue('modal_input_field'); // フィールド名は実際のモーダルに合わせる

    // モーダル結果をログに出力（必要に応じて）
    console.log(`モーダルデータ: ${modalData}`);

    // 承認ボタンを作成
    const approveButton = new ButtonBuilder()
      .setCustomId('approve')
      .setLabel('✅ 承認')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(approveButton);

    // モーダル入力後にメッセージを編集し、承認ボタンを追加
    await interaction.reply({
      content: `${modalData}\n\n承認ボタンをクリックして申請を承認してください。`,
      components: [row],
    });

  } catch (err) {
    console.error('❌ モーダル処理エラー:', err);
    await interaction.reply({
      content: '⚠️ モーダルの処理中にエラーが発生しました。',
      ephemeral: true
    });
  }
};
