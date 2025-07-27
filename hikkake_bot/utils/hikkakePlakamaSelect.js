// hikkake_bot/utils/hikkakePlakamaSelect.js
const { readState, writeState } = require('./hikkakeStateManager');
const { updateAllHikkakePanels } = require('./hikkakePanelManager');
const { logToThread } = require('./threadLogger');
const { createSelectMenuRow, createNumericOptions } = require('./discordUtils');

module.exports = {
  customId: /^hikkake_plakama_step(1|2)_(quest|tosu|horse)/,
  async handle(interaction) {
    const match = interaction.customId.match(this.customId);
    const step = parseInt(match[1], 10);
    const type = match[2];

    if (step === 1) {
      // Step 1: Receive "Pura" count and display the "Kama" select menu.
      const puraCount = interaction.values[0];
      const newCustomId = `hikkake_plakama_step2_${type}_${puraCount}`;
      const row = createSelectMenuRow(newCustomId, 'カマの人数を選択 (1-25)', createNumericOptions(25, '人'));
      await interaction.update({
        content: `【${type.toUpperCase()}】プラ: ${puraCount}人。次にカマの人数を選択してください。`,
        components: [row],
      });
    } else if (step === 2) {
      // Step 2: Receive "Kama" count and finalize the process.
      // Immediately acknowledge the interaction to prevent timeout
      await interaction.deferUpdate();

      const puraCount = parseInt(interaction.customId.split('_')[4], 10);
      const kamaCount = parseInt(interaction.values[0], 10);

      if (isNaN(puraCount) || isNaN(kamaCount)) {
        return interaction.update({ content: 'エラー: 人数の解析に失敗しました。', components: [] });
      }

      const guildId = interaction.guildId;
      const state = await readState(guildId);

      state.staff[type].pura = puraCount;
      state.staff[type].kama = kamaCount;

      await writeState(guildId, state);
      await updateAllHikkakePanels(interaction.client, guildId, state);

      try {
        await logToThread(guildId, type, interaction.client, {
          user: interaction.user,
          logType: 'プラカマ設定',
          details: { pura: puraCount, kama: kamaCount },
          channelName: interaction.channel.name,
        });
      } catch (e) {
        console.warn('[hikkakePlakamaSelect] ログ出力失敗', e);
      }

      await interaction.editReply({
        content: `✅ 【${type.toUpperCase()}】の基本スタッフを プラ: ${puraCount}人, カマ: ${kamaCount}人 に設定しました。`,
        components: [],
      });
    }
  }
};