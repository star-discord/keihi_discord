const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('経費申請設置')
    .setDescription('経費申請の案内メッセージを送信します'),

  async execute(interaction) {
    const channel = interaction.channel;

    // テキストチャンネル以外では実行不可
    if (!channel || channel.type !== ChannelType.GuildText) {
      try {
        await interaction.reply({
          content: 'このコマンドはテキストチャンネルでのみ使用できます。',
          ephemeral: true,
        });
      } catch (err) {
        console.error('❌ リプライ送信エラー:', err);
      }
      return;
    }

    // 同様の案内メッセージがあれば削除
    try {
      const messages = await channel.messages.fetch({ limit: 50 });
      for (const msg of messages.values()) {
        if (
          msg.author.id === interaction.client.user.id &&
          msg.content.includes('経費申請をする場合は以下のボタンを押してください。')
        ) {
          await msg.delete().catch(console.error);
        }
      }
    } catch (err) {
      console.error('❌ メッセージ取得/削除エラー:', err);
    }

    // ボタン構築
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('expense_apply_button')
        .setLabel('経費申請する')
        .setStyle(ButtonStyle.Primary)
    );

    // 案内メッセージ送信
    try {
      await interaction.reply({
        content: '経費申請をする場合は以下のボタンを押してください。',
        components: [row],
      });
    } catch (err) {
      console.error('❌ メッセージ送信失敗:', err);
    }
  },
};


