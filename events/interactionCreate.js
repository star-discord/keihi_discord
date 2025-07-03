import {
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ThreadAutoArchiveDuration,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';

import { Storage } from '@google-cloud/storage';

// GCPのバケット名とファイルパス（要適宜変更）
const bucketName = 'keihi-discord-bot-data-948332309706';
const fileName = 'keihi/expenses_all.json';

const storage = new Storage();

async function appendExpenseData(newEntry) {
  try {
    const file = storage.bucket(bucketName).file(fileName);
    let allData = {};

    // 既存ファイルの有無チェック
    const [exists] = await file.exists();
    if (exists) {
      const contents = await file.download();
      allData = JSON.parse(contents[0].toString());
    }

    const ym = newEntry.timestamp.slice(0, 7); // "YYYY-MM"

    if (!allData[ym]) {
      allData[ym] = [];
    }

    allData[ym].push(newEntry);

    await file.save(JSON.stringify(allData, null, 2), {
      contentType: 'application/json',
    });

    console.log('✅ 経費データをCloud Storageに追記しました');
  } catch (error) {
    console.error('❌ Cloud Storage保存エラー:', error);
    throw error; // 失敗時は呼び出し元で処理可能に
  }
}

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    const client = interaction.client;

    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`コマンド実行エラー [${interaction.user.tag}]:`, error);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: 'コマンド実行中にエラーが発生しました。',
            flags: 64,
          });
        }
      }
      return;
    }

    if (interaction.isButton()) {
      if (interaction.customId === 'expense_apply_button') {
        if (interaction.replied || interaction.deferred) return;

        const modal = new ModalBuilder()
          .setCustomId('expense_apply_modal')
          .setTitle('経費申請フォーム');

        const expenseItemInput = new TextInputBuilder()
          .setCustomId('expenseItem')
          .setLabel('経費項目 (例: 交通費、資料代)')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const amountInput = new TextInputBuilder()
          .setCustomId('amount')
          .setLabel('金額 (例: 1000)')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const notesInput = new TextInputBuilder()
          .setCustomId('notes')
          .setLabel('備考（任意）')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(false);

        modal.addComponents(
          new ActionRowBuilder().addComponents(expenseItemInput),
          new ActionRowBuilder().addComponents(amountInput),
          new ActionRowBuilder().addComponents(notesInput),
        );

        try {
          await interaction.showModal(modal);
        } catch (error) {
          console.error(`モーダル表示エラー [${interaction.user.tag}]:`, error);
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: 'モーダルの表示に失敗しました。', flags: 64 });
          }
        }
        return;
      }
      return;
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'expense_apply_modal') {
        if (interaction.replied || interaction.deferred) return;

        const expenseItem = interaction.fields.getTextInputValue('expenseItem');
        const amount = interaction.fields.getTextInputValue('amount');
        const notes = interaction.fields.getTextInputValue('notes') || '（備考なし）';

        const channel = interaction.channel;
        if (!channel) {
          await interaction.reply({ content: 'この操作はテキストチャンネルでのみ可能です。', ephemeral: true });
          return;
        }

        try {
          await interaction.deferReply({ ephemeral: true }); // モーダル応答保留（モーダルを閉じる）

          const now = new Date();
          const yearMonth = now.toISOString().slice(0, 7);
          const formattedDate = now.toLocaleString('ja-JP', {
            timeZone: 'Asia/Tokyo',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }).replace(/\//g, '-');

          const threadName = `経費申請-${yearMonth}`;
          let thread;

          // スレッド取得 or 作成
          const threads = await channel.threads.fetch();
          thread = threads.threads.find(t => t.name === threadName);

          if (!thread) {
            thread = await channel.threads.create({
              name: threadName,
              autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
              reason: `経費申請スレッド作成 by ${interaction.user.tag}`,
            });
          }

          // Cloud Storageにデータ保存
          try {
            await appendExpenseData({
              userId: interaction.user.id,
              username: interaction.user.username,
              expenseItem,
              amount: Number(amount),
              notes,
              timestamp: now.toISOString(),
            });
          } catch (e) {
            console.error('Cloud Storage保存失敗:', e);
            // 失敗しても申請はDiscord上に残したいので処理続行
          }

          // スレッドに申請内容を投稿
          const threadMessage = await thread.send(
            `**経費申請**\n- 名前: <@${interaction.user.id}>\n- 経費項目: ${expenseItem}\n- 金額: ${amount} 円\n- 備考: ${notes}`
          );

          // チャンネルに申請ログ投稿
          await channel.send(
            `経費申請しました。　${formattedDate}　${interaction.member?.displayName || interaction.user.username} (<@${interaction.user.id}>)　${threadMessage.url}`
          );

          // 既存案内メッセージ削除（過去50件）
          try {
            const fetchedMessages = await channel.messages.fetch({ limit: 50 });
            for (const msg of fetchedMessages.values()) {
              if (
                msg.author.id === interaction.client.user.id &&
                msg.content.includes('経費申請をする場合は以下のボタンを押してください。')
              ) {
                try {
                  await msg.delete();
                } catch (e) {
                  console.error('既存案内メッセージ削除失敗:', e);
                }
              }
            }
          } catch (err) {
            console.error('案内メッセージ取得失敗:', err);
          }

          // 新しい案内メッセージ送信
          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('expense_apply_button')
              .setLabel('経費申請をする場合は以下のボタンを押してください。')
              .setStyle(ButtonStyle.Primary)
          );

          await channel.send({
            content: '経費申請をする場合は以下のボタンを押してください。',
            components: [row],
          });

          // deferReplyの応答を編集（モーダル閉じて完了メッセージ）
          await interaction.editReply('経費申請を受け付けました。ありがとうございます。');

        } catch (e) {
          console.error(`[${interaction.user.tag}] モーダル送信処理エラー:`, e);
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '申請内容の送信に失敗しました。', ephemeral: true });
          }
        }
        return;
      }
    }
  },
};
