const { SlashCommandBuilder } = require('discord.js');
const { getApproverRoles, setApproverRoles } = require('../utils/gcs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("経費申請設定")
    .setDescription("経費申請用の設定を行います")
    .addSubcommand(sub =>
      sub.setName("承認ロール")
        .setDescription("承認ボタンを押せるロールを設定")
        .addRoleOption(option =>
          option.setName("ロール1").setDescription("承認ロール1").setRequired(true))
        .addRoleOption(option =>
          option.setName("ロール2").setDescription("承認ロール2").setRequired(false))
    ),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub !== "承認ロール") return;

    const guildId = interaction.guildId;
    const roles = [];

    for (let i = 1; i <= 2; i++) {
      const role = interaction.options.getRole(`ロール${i}`);
      if (role) roles.push(role.id);
    }

    await setApproverRoles(guildId, roles);

    await interaction.reply({
      content: `✅ 承認ロールを設定しました：${roles.map(r => `<@&${r}>`).join(", ")}`,
      ephemeral: true
    });
  }
};
