const { getApproverRoles, updateApprovalStatus, getExpenseEntries } = require('../utils/fileStorage');

module.exports = {
  data: {
    name: 'approve_button'
  },

  async execute(interaction) {
    const guildId = interaction.guildId;
    const member = interaction.member;
    const approverRoles = getApproverRoles(guildId);

    if (!approverRoles.some(roleId => member.roles.cache.has(roleId))) {
      return await interaction.reply({
        content: 'あなたには承認権限がありません。',
        ephemeral: true
      });
    }

    const message = interaction.message;
    const threadMessageId = message.id;
    const nameTag = member.displayName || interaction.user.username;

    const now = new Date();
    const yearMonth = now.toISOString().slice(0, 7);

    // ✅ 承認更新
    updateApprovalStatus(guildId, yearMonth, threadMessageId, interaction.user.id, nameTag);

    // ✅ 最新の承認リストを取得（再取得）
    const allEntries = getExpenseEntries(guildId, yearMonth);
    const entry = allEntries.find(e => e.threadMessageId === threadMessageId);
    const approvedList = entry?.approvedBy || [];

    // ✅ メッセージ更新内容
    let newContent = message.content;
    const usernames = [...new Set(approvedList.map(u => u.username))];

    if (!newContent.includes('✅ 承認済')) {
      newContent += `\n✅ 承認済（1名）: ${nameTag}`;
    } else {
      newContent = newContent.replace(/✅ 承認済.+/, `✅ 承認済（${usernames.length}名）: ${usernames.join(', ')}`);
    }

    try {
      await message.edit({ content: newContent });
      await interaction.reply({ content: '承認しました。', ephemeral: true });
    } catch (err) {
      console.error('✅ メッセージ編集失敗:', err);
      await interaction.reply({ content: '承認処理中にエラーが発生しました。', ephemeral: true });
    }
  }
};

