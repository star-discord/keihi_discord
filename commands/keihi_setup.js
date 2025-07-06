const { ButtonBuilder, ButtonStyle, ActionRowBuilder, SlashCommandBuilder } = require('discord.js');
const { getApproverRoles } = require('../utils/gcs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("経費申請設置")
    .setDescription("経費申請を設置します（モーダル＋承認ボタン付き）"),
  
  async execute(interaction) {
    // ここでは申請モーダル等の処理を省略し、申請結果メッセージ送信処理に焦点を当てます
    const guildId = interaction.guildId;

    // モーダル入力結果などのサンプルデータ
    const embed = {
      title: "経費申請",
      fields: [
        { name: "申請者", value: `<@${interaction.user.id}>` },
        { name: "内容", value: "備品購入：モニター 1台" },
        { name: "金額", value: "¥30,000" }
      ],
      footer: { text: "" },
      timestamp: new Date().toISOString()
    };

    // ボタン作成（承認ボタン）
    const approveButton = new ButtonBuilder()
      .setCustomId(`approve_${interaction.id}`)
      .setLabel("✅ 承認")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(approveButton);

    // ログ用チャンネルに送信（または interaction チャンネル）
    const message = await interaction.channel.send({
      embeds: [embed],
      components: [row]
    });

    await interaction.reply({
      content: "✅ 経費申請を送信しました。",
      ephemeral: true
    });
  }
};
