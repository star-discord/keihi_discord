const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  RoleSelectMenuBuilder,
  ActionRowBuilder,
  ComponentType,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const { setApproverRoles } = require('../utils/fileStorage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('経費申請設定')
    .setDescription('経費申請の設定を行います')
    .addSubcommand(sub =>
      sub.setName('承認ロール')
        .setDescription('承認できるロールを設定します'))
    .addSubcommand(sub =>
      sub.setName('設置')
        .setDescription('経費申請メッセージを設置します'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === '承認ロール') {
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
          ephemeral: true
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
        await interaction.reply({
          content: 'エラーが発生しました。もう一度お試しください。',
          ephemeral: true
        });
      }
    }

    if (sub === '設置') {
      try {
        const applyButton = new ButtonBuilder()
          .setCustomId('expense_apply_button')
          .setLabel('経費申請をする')
          .setStyle(ButtonStyle.Primary);

        const approveButton = new ButtonBuilder()
          .setCustomId('approve_button')
          .setLabel('承認する')
          .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(applyButton, approveButton);

        await interaction.reply({
          content: '📋 経費申請をする場合は以下のボタンを押してください。\n承認者には「承認する」ボタンが表示されます。',
          components: [row]
        });
      } catch (err) {
        console.error('❌ 設置エラー:', err);
        await interaction.reply({
          content: 'メッセージの設置中にエラーが発生しました。',
          ephemeral: true
        });
      }
    }
  }
};

