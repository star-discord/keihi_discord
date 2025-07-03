import { SlashCommandBuilder } from 'discord.js';
import { loadFromCloud } from '../utils/cloudStorage.js';  // 先に作成済みのCloud Storageユーティリティ

export const data = new SlashCommandBuilder()
  .setName('経費履歴')
  .setDescription('過去の経費申請履歴を表示します');

export async function execute(interaction) {
  await interaction.deferReply(); // 時間がかかる処理向けに defer

  // Cloud Storageのファイルパス（例）
  const filePath = 'keihi_data.json';

  const data = await loadFromCloud(filePath);

  if (!data || data.length === 0) {
    await interaction.editReply('経費申請の履歴はまだありません。');
    return;
  }

  // 最新30件を取得（降順）
  const recentItems = data.slice(-30).reverse();

  const lines = recentItems.map(item => {
    const dateStr = new Date(item.timestamp).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    return `- ${dateStr} | <@${item.userId}> | ${item.expenseItem} | ${item.amount}円 | ${item.notes || '-'}`;
  });

  // Discordメッセージ長制限（約2000文字）に注意して分割も検討可
  const message = '**📜 経費申請履歴（最新30件）**\n' + lines.join('\n');

  await interaction.editReply(message);
}
