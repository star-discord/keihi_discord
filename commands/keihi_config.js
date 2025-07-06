const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  RoleSelectMenuBuilder,
  ActionRowBuilder,
  ComponentType,
} = require('discord.js');

const { setApproverRoles } = require('../utils/fileStorage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('経費申請設定') // コマンド名：重複なし
    .setDescription('承認できるロールを設定します')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      const menu = new RoleSelectMenuBuilder()
        .setCustomId('select_approver_roles')
        .setPlaceholder('承認ロールを選択...')
        .setMinValues(1)
        .setMaxValues(5);

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.reply({
        content: '✅ 承認ロールを選択してください（複数選択可）',
        components: [row],
        ephemeral: true,
      });

      const collector = interaction.channel.createMessageComponentCollector({
        componentType: ComponentType.RoleSelect,
        time: 60_000,
        filter: i => i.customId === 'select_approver_roles' && i.user.id === interaction.user.id,
      });

      collector.once('collect', async i => {
        const selectedRoleIds = i.values;
        await setApproverRoles(interaction.guildId, selectedRoleIds);

        await i.update({
          content: `✅ 承認ロールを設定しました：${selectedRoleIds.map(id => `<@&${id}>`).join(', ')}`,
          components: []
        });
      });

      collector.once('end', collected => {
        if (collected.size === 0) {
          interaction.editReply({
            content: '⏱️ タイムアウトしました。もう一度コマンドを実行してください。',
            components: []
          }).catch(console.error);
        }
      });
    } catch (err) {
      console.error('❌ 承認ロール設定エラー:', err);
      if (!interaction.replied) {
        await interaction.reply({
          content: 'エラーが発生しました。もう一度お試しください。',
          ephemeral: true
        });
      }
    }
  }
};

