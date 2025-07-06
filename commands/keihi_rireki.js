const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder
} = require('discord.js');

const { getAvailableExpenseFiles } = require('../utils/fileStorage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('経費申請履歴')
    .setDescription('自分の経費申請履歴を確認します（選択式）'),

  async execute(interaction) {
    const guildId = interaction.guildId;

    const files = getAvailableExpenseFiles(guildId);

    if (files.length === 0) {
      return await interaction.reply({
        content: '📁 履歴ファイルが見つかりませんでした。',
        ephemeral: true
      });
    }

    const options = files.map(ym => ({
      label: ym,
      value: ym
    }));

    const select = new StringSelectMenuBuilder()
      .setCustomId('select_expense_history')
      .setPlaceholder('確認したい年月を選択')
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(select);

    await interaction.reply({
      content: '📅 確認したい年月を選んでください：',
      components: [row],
      ephemeral: true
    });
  }
};

