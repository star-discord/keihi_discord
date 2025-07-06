const {
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} = require('discord.js');
const {
  getApproverRoles,
  updateApprovalStatus
} = require('../../utils/fileStorage');

module.exports = async function handleApproveButton(interaction) {
  const guildId = interaction.guildId;
  const member = interaction.member;
  const userId = interaction.user.id;
  const username = interaction.user.username;

  // ✅ ロールチェック
  const approverRoles = getApproverRoles(guildId);
  const hasApproverRole = member.roles.cache.some(role => approverRoles.includes(role.id));

  if (!hasApproverRole) {
    return interaction.reply({
      content: '⛔ あなたは承認権限を持っていません。',
      ephemeral: true
    });
  }

  // ✅ メッセージIDと日時から対象年月を抽出
  const messageId = interaction.message.id;
  const createdAt = interaction.message.createdAt;
  const yearMonth = createdAt.toISOString().slice(0, 7);

  // ✅ 承認ステータス更新
  const approvedBy = updateApprovalStatus(guildId, yearMonth, messageId, userId, username);

  // ✅ 表示更新：人数/最大数、ユーザー名一覧
  const approverNames = approvedBy.map(a => a.username).join(', ');
  const content = `✅ 承認 (${approvedBy.length}/${approverRoles.length})：${approverNames}`;

  try {
    await interaction.update({
      content,
      components: interaction.message.components // ボタンそのまま
    });
  } catch (err) {
    console.error('❌ 承認メッセージ更新失敗:', err);
    await interaction.reply({
      content: '⚠️ 承認処理に失敗しました。',
      ephemeral: true
    });
  }
};

