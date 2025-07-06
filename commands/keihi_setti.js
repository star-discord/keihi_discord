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

    // ✅ テキストチャンネルでなければ終了
    if (!channel || channel.type !== ChannelType.GuildText) {
      return interaction.reply({
        content: 'このコマンドはテキストチャンネルでのみ使用できます。',
        ephemeral: true
      });
    }

    // ✅ 承認ロール取得（存在しない場合も許容）
    const approverRoles = getApproverRoles(interaction.guildId) || [];
    if (approverRoles.length === 0) {
      console.warn(`[警告] ギルド ${interaction.guildId} に承認ロールが未設定です`);
    }

    try {
      // ✅ 過去の案内メッセージを削除
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
      console.error('❌ 過去メッセージ削除時のエラー:', err);
    }

    try {
      // ✅ ボタン作成
      const applyButton = new ButtonBuilder()
        .setCustomId('expense_apply_button')
        .setLabel('経費申請する')
        .setStyle(ButtonStyle.Primary);

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

      console.log(`[設置] 経費申請ボタンを送信しました in ${interaction.guildId} / #${channel.name}`);

    } catch (err) {
      console.error('❌ 経費申請ボタン送信エラー:', err);
      await interaction.reply({
        content: '⚠️ 経費申請の案内設置に失敗しました。',
        ephemeral: true
      });
    }
  }
};

