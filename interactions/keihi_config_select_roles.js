const { setApproverRoles } = require('../utils/fileStorage');

module.exports = async function (interaction) {
  try {
    const selectedRoleIds = interaction.values;
    const guildId = interaction.guildId;

    await setApproverRoles(guildId, selectedRoleIds);

    await interaction.update({
      content: `✅ 承認ロールを設定しました：${selectedRoleIds.map(id => `<@&${id}>`).join(', ')}`,
      components: []
    });
  } catch (err) {
    console.error('❌ 承認ロール設定エラー:', err);
    await interaction.reply({
      content: '⚠️ 承認ロールの設定に失敗しました。',
      ephemeral: true
    });
  }
};
