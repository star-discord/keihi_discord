const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder
} = require('discord.js');

const { getAvailableExpenseFiles } = require('../utils/fileStorage');
const MESSAGES = require('../constants/messages');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('経費申請履歴')
    .setDescription('自分の経費申請履歴を確認します（選択式）'),

  async execute(interaction) {
    try {
      const guildId = interaction.guildId;

      // ✅ ログファイル（yyyy-mm）の一覧取得
      const yearMonthList = getAvailableExpenseFiles(guildId);

      if (!yearMonthList || yearMonthList.length === 0) {
        return await interaction.reply({
          content: MESSAGES.HISTORY_FILE_NOT_FOUND,
          ephemeral: true
        });
      }

      const options = yearMonthList.map(ym => ({
        label: ym,
        value: ym
      }));

      const select = new StringSelectMenuBuilder()
        .setCustomId('history_year_month')
        .setPlaceholder('確認したい年月を選択')
        .addOptions(options);

      const row = new ActionRowBuilder().addComponents(select);

      await interaction.reply({
        content: MESSAGES.HISTORY_SELECT_PROMPT,
        components: [row],
        ephemeral: true
      });

    } catch (err) {
      console.error('❌ 経費申請履歴コマンド実行中にエラー:', err);
      await interaction.reply({
        content: MESSAGES.ERROR_OCCURRED,
        ephemeral: true
      });
    }
  }
};
