const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('経費申請embed')
    .setDescription('経費申請botでメッセージ送信ができます'), 

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📩 経費申請botメッセージ送信') 
      .setDescription('以下のボタンからメッセージを入力してください。') 
      .setColor(0x3498db);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('keihi_embed') // ボタンIDに対応
        .setLabel('bot送信') 
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false, // 公開 or 管理用に true も可
    });
  },
};