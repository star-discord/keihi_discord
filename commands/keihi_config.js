const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  RoleSelectMenuBuilder,
  ActionRowBuilder,
  ComponentType
} = require('discord.js');

const {
  setApproverRoles,
  setVisibleRoles
} = require('../utils/fileStorage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('経費申請設定')
    .setDescription('承認・表示ロールを設定します')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      const approverMenu = new RoleSelectMenuBuilder()
        .setCustomId('select_approver_roles')
        .setPlaceholder('✅ 承認ロールを選択（必須）')
        .setMinValues(1)
        .setMaxValues(5);

      const visibleMenu = new RoleSelectMenuBuilder()
        .setCustomId('select_visible_roles')
        .setPlaceholder('👁 表示ロールを選択（任意）')
        .setMinValues(0)
        .setMaxValues(5);

      const row1 = new ActionRowBuilder().addComponents(approverMenu);
      const row2 = new ActionRowBuilder().addComponents(visibleMenu);

      await interaction.reply({
        content: '設定したいロールを選択してください：',
        components: [row1, row2],
        ephemeral: true
      });

      const collector = interaction.channel.createMessageComponentCollector({
        componentType: ComponentType.RoleSelect,
        time: 60_000,
        filter: i => i.user.id === interaction.user.id
      });

      const selected = {};

      collector.on('collect', async i => {
        if (i.customId === 'select_approver_roles') {
          selected.approverRoles = i.values;
          await i.reply({ content: '✅ 承認ロールを受け取りました。', ephemeral: true });
        }

        if (i.customId === 'select_visible_roles') {
          selected.visibleRoles = i.values;
          await i.reply({ content: '👁 表示ロールを受け取りました。', ephemeral: true });
        }

        // 両方揃ったら保存して終了
        if (selected.approverRoles && selected.visibleRoles !== undefined) {
          setApproverRoles(interaction.guildId, selected.approverRoles);
          setVisibleRoles(interaction.guildId, selected.visibleRoles);

          await interaction.editReply({
            content: `✅ 承認ロール: ${selected.approverRoles.map(r => `<@&${r}>`).join(', ')}\n` +
                     `👁 表示ロール: ${selected.visibleRoles.length > 0 ? selected.visibleRoles.map(r => `<@&${r}>`).join(', ') : '（なし）'}`,
            components: []
          });
          collector.stop();
        }
      });

      collector.once('end', collected => {
        if (!selected.approverRoles) {
          interaction.editReply({
            content: '⏱️ タイムアウトしました。再度コマンドを実行してください。',
            components: []
          }).catch(console.error);
        }
      });
    } catch (err) {
      console.error('❌ ロール設定エラー:', err);
      await interaction.reply({
        content: '⚠️ ロール設定中にエラーが発生しました。',
        ephemeral: true
      });
    }
  }
};
