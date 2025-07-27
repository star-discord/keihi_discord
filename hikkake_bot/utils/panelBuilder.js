// utils/panelBuilder.js

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { DateTime } = require('luxon');

/**
 * Builds one of the two panel embeds.
 * @param {'status' | 'orders'} panelType - The type of panel to build.
 * @param {'quest' | 'tosu' | 'horse'} hikkakeType - The category.
 * @param {object} state - The current state object.
 * @returns {EmbedBuilder}
 */
function buildPanelEmbed(panelType, hikkakeType, state, guildId) {

  if (panelType === 'status') {
    let orderedTypes;

    // パネルのプライマリカテゴリに基づいて表示順を設定
    switch (hikkakeType) {
      case 'quest':
        orderedTypes = ['quest', 'tosu', 'horse'];
        break;
      case 'tosu':
        orderedTypes = ['tosu', 'quest', 'horse'];
        break;
      case 'horse':
        orderedTypes = ['horse', 'tosu', 'quest'];
        break;
      default:
        orderedTypes = ['quest', 'tosu', 'horse'];
        break;
    }

    const titleMap = {
      quest: '【📜｜クエスト依頼】',
      tosu: '【🔭｜凸スナ】',
      horse: '【🐴｜トロイの木馬-旧店況】',
    };

    const linkTextMap = {
      quest: '【📜｜クエスト依頼】へ',
      tosu: '【🔭｜凸スナ】へ',
      horse: '【🐴｜トロイの木馬-旧店況】へ',
    };

    const fields = orderedTypes.map(type => {
      const staff = state.staff?.[type] || { pura: 0, kama: 0 };
      const orders = state.orders?.[type] || [];
      const allocatedPura = orders
        .filter(order => order.type === 'order') // 「受注」ログのみをキャスト消費として計算
        .reduce((sum, order) => sum + (order.castPura || 0), 0);
      const allocatedKama = orders
        .filter(order => order.type === 'order') // 「受注」ログのみをキャスト消費として計算
        .reduce((sum, order) => sum + (order.castKama || 0), 0);
      const availablePura = (staff.pura || 0) - allocatedPura;
      const availableKama = (staff.kama || 0) - allocatedKama;

      const panelInfo = state.panelMessages?.[type];
      // 各カテゴリの「受注一覧」パネルへのメッセージリンクを生成
      const messageLink = panelInfo && panelInfo.channelId && panelInfo.ordersMessageId && guildId
        ? `https://discord.com/channels/${guildId}/${panelInfo.channelId}/${panelInfo.ordersMessageId}`
        : '#'; // リンクが作れない場合のフォールバック

      // Define linkText using the map and the generated link
      const linkText = `[${linkTextMap[type]}](${messageLink})`;

      return {
        name: `${titleMap[type]}`,
        value: `${linkText}\nプラ: ${availablePura}人\nカマ: ${availableKama}人`,
      };
    });

    return new EmbedBuilder()
      .setTitle('■ 店内状況')
      .setFields(fields)
      .setColor(0x0099ff)
      .setTimestamp();
  }

  if (panelType === 'orders') {
    const orders = state.orders?.[hikkakeType] || [];
    const embed = new EmbedBuilder()
      .setTitle(`■ 受注一覧 (${hikkakeType.toUpperCase()})`)
      .setColor(0x00cc99)
      .setTimestamp();

    if (orders.length === 0) {
      embed.setDescription('現在、受注はありません。');
    } else {
      const description = orders.map(order => {
        const typeLabelMap = {
          order: '受注',
          casual_leave: '退店',
          casual_arrival: 'ふらっと来た',
        };
        const typeLabel = typeLabelMap[order.type] || 'ログ';

        const castPura = order.castPura || 0;
        const castKama = order.castKama || 0;
        const totalCast = castPura + castKama;
        const timestamp = DateTime.fromISO(order.timestamp).setZone('Asia/Tokyo').toFormat('HH:mm');
        const userMention = order.user?.id ? `<@${order.user.id}>` : '不明';

        let parts;
        if (order.type === 'casual_arrival') {
          parts = [`【${typeLabel}】スタッフ追加: プラ+${castPura}人 / カマ+${castKama}人`];
        } else {
          const peopleLabel = order.type === 'order' ? '人数' : '対象';
          parts = [`【${typeLabel}】キャスト: -${totalCast}人`, `${peopleLabel}: ${order.people}人`];
          if (order.type === 'order' && order.bottles > 0) {
            parts.push(`本数: ${order.bottles}本`);
          }
        }
        const meta = `${timestamp} ${userMention}`;
        return `${parts.join('　')}　　${meta}`;
      }).join('\n');
      embed.setDescription(description);
    }
    return embed;
  }

  // Fallback for unknown type
  return new EmbedBuilder().setTitle('エラー').setDescription('不明なパネルタイプです。');
}

function buildPanelButtons(type) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`hikkake_${type}_plakama`)
      .setLabel('プラカマ')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`hikkake_${type}_order`)
      .setLabel('受注')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`hikkake_${type}_leave`)
      .setLabel('退店')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`hikkake_${type}_arrival`)
      .setLabel('ふらっと来た')
      .setStyle(ButtonStyle.Secondary),
  );
  return [row];
}

module.exports = {
  buildPanelEmbed,
  buildPanelButtons,
};
