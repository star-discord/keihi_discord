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

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    const client = interaction.client;

    // スラッシュコマンド処理
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

    // ボタン押下時
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

    // モーダル送信時
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'expense_apply_modal') {
        if (interaction.replied || interaction.deferred) return;

        const expenseItem = interaction.fields.getTextInputValue('expenseItem');
        const amount = interaction.fields.getTextInputValue('amount');
        const notes = interaction.fields.getTextInputValue('notes') || '（備考なし）';

        const channel = interaction.channel;
        if (!channel) {
          await interaction.reply({ content: 'この操作はテキストチャンネルでのみ可能です。', flags: 64 });
          return;
        }

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

        try {
          const threads = await channel.threads.fetch();
          thread = threads.threads.find(t => t.name === threadName);

          if (!thread) {
            thread = await channel.threads.create({
              name: threadName,
              autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
              reason: `経費申請スレッド作成 by ${interaction.user.tag}`,
            });
          }
        } catch (e) {
          console.error(`[${interaction.user.tag}] スレッド取得・作成エラー:`, e);
          await interaction.reply({ content: 'スレッドの取得または作成に失敗しました。', flags: 64 });
          return;
        }

        try {
          const threadMessage = await thread.send(
            `**経費申請**\n- 名前: <@${interaction.user.id}>\n- 経費項目: ${expenseItem}\n- 金額: ${amount} 円\n- 備考: ${notes}`
          );

          await channel.send(
            `経費申請しました。　${formattedDate}　${interaction.member?.displayName || interaction.user.username} (<@${interaction.user.id}>)　${threadMessage.url}`
          );

          // 案内メッセージ削除（過去50件）
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
        } catch (e) {
          console.error(`[${interaction.user.tag}] メッセージ送信エラー:`, e);
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '申請内容の送信に失敗しました。', flags: 64 });
          }
        }
        return;
      }
    }
  },
};
