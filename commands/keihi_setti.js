// keihi_setti.js
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType
} = require('discord.js');

const { getApproverRoles } = require('../utils/fileStorage');
const MESSAGES = require('../constants/messages');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('経費申請設置')
    .setDescription('経費申請の案内メッセージを送信します（承認ボタン付き）'),

  async execute(interaction) {
    const channel = interaction.channel;

    // ✅ テキストチャンネルチェック
    if (!channel || channel.type !== ChannelType.GuildText) {
      return interaction.reply({
        content: MESSAGES.NOT_TEXT_CHANNEL,
        ephemeral: true
      });
    }

    const guildId = interaction.guildId;
    const approverRoles = getApproverRoles(guildId) || [];

    if (approverRoles.length === 0) {
      console.warn(`[警告] ギルド ${guildId} に承認ロールが未設定です`);
    }

    // ✅ 過去の案内メッセージ削除（最大50件）
    try {
      const messages = await channel.messages.fetch({ limit: 50 });

      for (const msg of messages.values()) {
        if (
          msg.author.id === interaction.client.user.id &&
          msg.content.includes('経費申請をする場合は以下のボタンを押してください。')
        ) {
          await msg.delete();
          console.log(`🗑️ 過去の案内メッセージ削除: ${msg.id}`);
        }
      }
    } catch (err) {
      console.error('❌ 過去案内メッセージ削除エラー:', err);
    }

    // ✅ ボタンとメッセージ送信
    try {
      const applyButton = new ButtonBuilder()
        .setCustomId('apply') // ✅ 修正: expense_apply_button → apply
        .setLabel('経費申請する')
        .setStyle(ButtonStyle.Primary);

      const approveButton = new ButtonBuilder()
        .setCustomId('approve') // ✅ 修正: approve_button → approve
        .setLabel('✅ 承認')
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder().addComponents(applyButton, approveButton);

      await interaction.reply({
        content: MESSAGES.THREAD_HEADER,
        components: [row]
      });

      console.log(`[設置完了] 経費申請ボタン in ${guildId} / #${channel.name}`);

    } catch (err) {
      console.error('❌ 経費申請案内メッセージ送信エラー:', err);
      await interaction.reply({
        content: MESSAGES.ERROR_OCCURRED,
        ephemeral: true
      });
    }
  }
};

