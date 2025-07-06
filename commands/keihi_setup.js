const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const { getApproverRoles } = require('../utils/fileStorage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("経費申請設置")
    .setDescription("経費申請を設置します（モーダル＋承認ボタン付き）"),

  async execute(interaction) {
    const guildId = interaction.guildId;

    try {
      // ✅ 承認ロール取得
      const approverRoles = getApproverRoles(guildId);

      // ✅ Embed 内容作成
      const embed = {
        title: "経費申請",
        color: 0x00bfff,
        fields: [
          { name: "申請者", value: `<@${interaction.user.id}>` },
          { name: "内容", value: "備品購入：モニター 1台" },
          { name: "金額", value: "¥30,000" }
        ],
        footer: { text: "承認ボタンで対応してください。" },
        timestamp: new Date().toISOString()
      };

      // ✅ ボタン作成
      const approveButton = new ButtonBuilder()
        .setCustomId(`approve_${interaction.user.id}`) // 後で interactionCreate 側で照合可
        .setLabel("✅ 承認")
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder().addComponents(approveButton);

      // ✅ メッセージ送信
      const sentMessage = await interaction.channel.send({
        embeds: [embed],
        components: [row]
      });

      await interaction.reply({
        content: "✅ 経費申請を送信しました。",
        ephemeral: true
      });

    } catch (err) {
      console.error("❌ 経費申請設置時のエラー:", err);
      await interaction.reply({
        content: "⚠️ 経費申請の設置に失敗しました。",
        ephemeral: true
      });
    }
  }
};