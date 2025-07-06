const { getApproverRoles } = require('../utils/gcs');

async function handleApproveButton(interaction) {
  const guildId = interaction.guildId;
  const member = interaction.member;
  const user = interaction.user;

  const approverRoles = await getApproverRoles(guildId);

  const hasRole = approverRoles.some(roleId => member.roles.cache.has(roleId));
  if (!hasRole) {
    await interaction.reply({
      content: '❌ あなたには承認権限がありません。',
      ephemeral: true
    });
    return;
  }

  const message = interaction.message;
  const content = message.content || '';
  const alreadyApproved = content.includes(`@${user.username}`);

  if (alreadyApproved) {
    await interaction.reply({
      content: '⚠️ あなたはすでに承認済みです。',
      ephemeral: true
    });
    return;
  }

  const updatedContent = content + `\n✅ 承認者: @${user.username}`;
  await message.edit({ content: updatedContent });

  await interaction.reply({
    content: '✅ 承認しました。',
    ephemeral: true
  });
}

module.exports = {
  handleApproveButton
};
