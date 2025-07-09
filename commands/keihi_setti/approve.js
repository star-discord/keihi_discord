const {
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} = require('discord.js');

const {
  getApproverRoles,
  updateApprovalStatus
} = require('../../utils/fileStorage.js');

module.exports = async function handleApproveButton(interaction) {
  const guildId = interaction.guildId;
  const member = interaction.member;
  const userId = interaction.user.id;
  const username = interaction.user.globalName || interaction.user.username;

  // ✅ ロールチェック
  const approverRoles = getApproverRoles(guildId);
  const hasApproverRole = member.roles.cache.some(role => approverRoles.includes(role.id));

  if (!hasApproverRole) {
    return interaction.reply({
      content: '⛔ あなたは承認権限を持っていません。',
      ephemeral: true
    });
  }

  // ✅ メッセージIDと年月取得
  const messageId = interaction.message.id;
  const createdAt = interaction.message.createdAt;
  const yearMonth = createdAt.toISOString().slice(0, 7);

  // ✅ 承認ステータス更新
  const approvedBy = updateApprovalStatus(guildId, yearMonth, messageId, userId, username);

  // ✅ 表示文作成
  const approverNames = approvedBy.map(a => a.username).join(', ');
  const max = approverRoles.length || 1;
  const progress = `(${approvedBy.length}/${max})`;

  const newContent = `✅ 承認 ${progress}：${approverNames}`;

  try {
    await interaction.update({
      content: newContent,
      components: interaction.message.components
    });
  } catch (err) {
    console.error('❌ 承認メッセージ更新失敗:', err);
    try {
      await interaction.reply({
        content: '⚠️ 承認処理に失敗しました。',
        ephemeral: true
      });
    } catch (e) {
      console.error('❌ 応答メッセージ送信失敗:', e);
    }
  }
};
