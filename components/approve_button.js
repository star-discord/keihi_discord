const {
  getApproverRoles,
  updateApprovalStatus,
  getExpenseEntries
} = require('../utils/fileStorage');

module.exports = {
  data: {
    name: 'approve_button'
  },

  async execute(interaction) {
    const guildId = interaction.guildId;
    const member = interaction.member;
    const approverRoles = getApproverRoles(guildId);

    // ✅ 権限チェック
    const hasPermission = approverRoles.some(roleId =>
      member.roles.cache.has(roleId)
    );

    if (!hasPermission) {
      return await interaction.reply({
        content: '❌ あなたには承認権限がありません。',
        ephemeral: true
      });
    }

    const targetMessage = interaction.message;
    const threadMessageId = targetMessage.id;
    const approverName = member.displayName || interaction.user.username;

    const now = new Date();
    const yearMonth = now.toISOString().slice(0, 7);

    // ✅ 承認ステータスを更新
    updateApprovalStatus(
      guildId,
      yearMonth,
      threadMessageId,
      interaction.user.id,
      approverName
    );

    // ✅ 最新のエントリ情報を取得
    const allEntries = getExpenseEntries(guildId, yearMonth);
    const entry = allEntries.find(e => e.threadMessageId === threadMessageId);

    if (!entry) {
      return await interaction.reply({
        content: '⚠️ 承認対象のデータが見つかりませんでした。',
        ephemeral: true
      });
    }

    const approvedList = entry.approvedBy || [];
    const uniqueNames = [...new Set(approvedList.map(u => u.username))];

    // ✅ メッセージ本文を編集
    let newContent = targetMessage.content;

    const approvedLine = `✅ 承認済（${uniqueNames.length}名）: ${uniqueNames.join(', ')}`;
    if (newContent.includes('✅ 承認済')) {
      newContent = newContent.replace(/✅ 承認済.+/, approvedLine);
    } else {
      newContent += `\n${approvedLine}`;
    }

    try {
      await targetMessage.edit({ content: newContent });
      await interaction.reply({ content: '✅ 承認しました。', ephemeral: true });
    } catch (err) {
      console.error('❌ メッセージ編集失敗:', err);
      await interaction.reply({
        content: '⚠️ 承認処理中にエラーが発生しました。',
        ephemeral: true
      });
    }
  }
};

