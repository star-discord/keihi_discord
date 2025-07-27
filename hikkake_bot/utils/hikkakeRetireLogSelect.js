// hikkake_bot/utils/hikkakeRetireLogSelect.js
const { readState, writeState } = require('./hikkakeStateManager');
const { updateAllHikkakePanels } = require('./hikkakePanelManager');
const { logToThread } = require('./threadLogger');

module.exports = {
  customId: /^hikkake_retire_log_(quest|tosu|horse)/,
  async handle(interaction) {
    await interaction.deferUpdate();

    const match = interaction.customId.match(this.customId);
    const type = match[1];
    const logIdToRetire = interaction.values[0];

    const guildId = interaction.guildId;
    const state = await readState(guildId);

    const logIndex = state.orders[type].findIndex(log => log.id === logIdToRetire);

    if (logIndex === -1) {
      await interaction.editReply({
        content: '❌ エラー: 対象のログが見つかりませんでした。既に取り消されている可能性があります。',
        components: [],
      });
      return;
    }

    // Remove the log and get its data
    const [retiredLog] = state.orders[type].splice(logIndex, 1);

    // If a "casual arrival" log is retired, it means those staff are now leaving, so decrement the staff count.
    if (retiredLog.type === 'casual_arrival') {
      state.staff[type].pura = Math.max(0, (state.staff[type].pura || 0) - (retiredLog.castPura || 0));
      state.staff[type].kama = Math.max(0, (state.staff[type].kama || 0) - (retiredLog.castKama || 0));
    }

    await writeState(guildId, state);
    await updateAllHikkakePanels(interaction.client, guildId, state);

    try {
      await logToThread(guildId, type, interaction.client, {
        user: interaction.user,
        logType: 'ログ（退店）',
        details: { retiredLog },
        channelName: interaction.channel.name,
      });
    } catch (e) {
      console.warn('[hikkakeRetireLogSelect] ログ出力失敗', e);
    }

    await interaction.editReply({
      content: '✅ 選択されたログを完了（退店）させました。',
      components: [],
    });
  },
};