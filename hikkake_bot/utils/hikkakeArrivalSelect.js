// hikkake_bot/utils/hikkakeArrivalSelect.js
const { readState, writeState } = require('./hikkakeStateManager');
const { updateAllHikkakePanels } = require('./hikkakePanelManager');
const { logToThread } = require('./threadLogger');
const { createSelectMenuRow, createNumericOptions } = require('./discordUtils');

module.exports = {
  customId: /^hikkake_arrival_step(1|2)_(quest|tosu|horse)/,
  async handle(interaction) {
    const match = interaction.customId.match(this.customId);
    const step = parseInt(match[1], 10);
    const type = match[2];

    if (step === 1) {
      // Step 1: プラの人数を受け取り、カマの人数選択メニューを表示
      const puraArrivalCount = interaction.values[0];
      const newCustomId = `hikkake_arrival_step2_${type}_${puraArrivalCount}`;
      const row = createSelectMenuRow(newCustomId, '追加カマの人数を選択 (0-24)', createNumericOptions(25, '人', 0));
      await interaction.update({
        content: `【${type.toUpperCase()}】追加プラ: ${puraArrivalCount}人。次に追加するカマの人数を選択してください。`,
        components: [row],
      });
    } else if (step === 2) {
      // Step 2: カマの人数を受け取り、最終処理
      await interaction.deferUpdate();
      
      const puraArrivalCount = parseInt(interaction.customId.split('_')[4], 10);
      const kamaArrivalCount = parseInt(interaction.values[0], 10);

      if (isNaN(puraArrivalCount) || isNaN(kamaArrivalCount)) {
        return interaction.editReply({ content: 'エラー: 人数の解析に失敗しました。', components: [] });
      }

      const guildId = interaction.guildId;
      const state = await readState(guildId);

      // スタッフ数を加算
      state.staff[type].pura = (state.staff[type].pura || 0) + puraArrivalCount;
      state.staff[type].kama = (state.staff[type].kama || 0) + kamaArrivalCount;

      // 受注一覧にログとして追加
      const newLogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type: 'casual_arrival',
        people: puraArrivalCount + kamaArrivalCount,
        bottles: 0,
        castPura: puraArrivalCount,
        castKama: kamaArrivalCount,
        timestamp: new Date().toISOString(),
        user: {
            id: interaction.user.id,
            username: interaction.user.username,
        },
        logUrl: null,
      };

      try {
        const logMessage = await logToThread(guildId, type, interaction.client, {
          user: interaction.user,
          logType: 'ふらっと来た',
          details: { pura: puraArrivalCount, kama: kamaArrivalCount },
          channelName: interaction.channel.name,
        });
        if (logMessage) {
            newLogEntry.logUrl = logMessage.url;
        }
      } catch (e) {
        console.warn('[hikkakeArrivalSelect] ログ出力失敗', e);
      }

      state.orders[type].push(newLogEntry);

      await writeState(guildId, state);
      await updateAllHikkakePanels(interaction.client, guildId, state);

      await interaction.editReply({
        content: `✅ 【${type.toUpperCase()}】に「ふらっと来た」スタッフ (プラ: ${puraArrivalCount}人, カマ: ${kamaArrivalCount}人) を追加しました。`,
        components: [],
      });
    }
  }
};