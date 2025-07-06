const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType
} = require('discord.js');

const { getApproverRoles } = require('../utils/fileStorage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('経費申請設置')
    .setDescription('経費申請の案内メッセージを送信します（承認ボタン付き）'),

  async execute(interaction) {
    const channel = interaction.channel;

    // ✅ テキストチャンネルでなければ中止
    if (!channel || channel.type !== ChannelType.GuildText) {
      return interaction.reply({
        content: 'このコマンドはテキストチャンネルでのみ使用できます。',
        ephemeral: true
      });
    }

    try {
      // ✅ 同様の案内が既にあれば削除
      const messages = await channel.messages.fetch({ limit: 50 });
      for (const msg of messages.values()) {
        if (
          msg.author.id === interaction.client.user.id &&
          msg.content.includes('経費申請をする場合は以下のボタンを押してください。')
        ) {
          await msg.delete().catch(console.error);
        }
      }

      // ✅ 承認ロール取得（存在しない場合は空配列）
      const approverRoles = getApproverRoles(interaction.guildId) || [];

      // ✅ 申請者用ボタン
      const applyButton = new ButtonBuilder()
        .setCustomId('expense_apply_button')
        .setLabel('経費申請する')
        .setStyle(ButtonStyle.Primary);

      // ✅ 承認者用ボタン（表示制御は `interactionCreate.js` 側で）
      const approveButton = new ButtonBuilder()
        .setCustomId('approve_button')
        .setLabel('✅ 承認')
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder().addComponents(applyButton, approveButton);

      // ✅ 案内メッセージ送信
      await interaction.reply({
        content: '📋 経費申請をする場合は以下のボタンを押してください。\n承認者には「承認」ボタンが表示されます。',
        components: [row]
      });

    } catch (err) {
      console.error('❌ 経費申請設置時のエラー:', err);
      await interaction.reply({
        content: '⚠️ 経費申請の案内設置に失敗しました。',
        ephemeral: true
      });
    }
  }
};

