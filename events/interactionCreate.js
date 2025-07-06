const {
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ThreadAutoArchiveDuration
} = require('discord.js');

const {
  appendExpenseLog,
  getExpenseEntries,
  getApproverRoles
} = require('../utils/fileStorage');

const {
  writeExpensesToSpreadsheet
} = require('../utils/spreadsheet');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // コマンド実行
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(`❌ コマンド実行エラー [${interaction.user.tag}]:`, err);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'コマンド実行中にエラーが発生しました。', ephemeral: true });
        }
      }
      return;
    }

    // 経費申請ボタン押下 → モーダル表示
    if (interaction.isButton() && interaction.customId === 'expense_apply_button') {
      if (interaction.replied || interaction.deferred) return;

      const modal = new ModalBuilder()
        .setCustomId('expense_apply_modal')
        .setTitle('経費申請フォーム');

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('expenseItem')
            .setLabel('経費項目')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('amount')
            .setLabel('金額')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('notes')
            .setLabel('備考（任意）')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false))
      );

      return await interaction.showModal(modal);
    }

    // 経費申請モーダル送信後
    if (interaction.isModalSubmit() && interaction.customId === 'expense_apply_modal') {
      if (interaction.replied || interaction.deferred) return;

      await interaction.deferReply({ ephemeral: true });

      const expenseItem = interaction.fields.getTextInputValue('expenseItem');
      const amount = interaction.fields.getTextInputValue('amount');
      const notes = interaction.fields.getTextInputValue('notes') || '（備考なし）';
      const channel = interaction.channel;
      const guildId = interaction.guildId;

      const now = new Date();
      const yearMonth = now.toISOString().slice(0, 7);
      const formattedDate = now.toLocaleString('ja-JP', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }).replace(/\//g, '-');

      let thread = (await channel.threads.fetch()).threads.find(t => t.name === `経費申請-${yearMonth}`);
      if (!thread) {
        thread = await channel.threads.create({
          name: `経費申請-${yearMonth}`,
          autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
          reason: `経費申請スレッド作成 by ${interaction.user.tag}`
        });
      }

      const entry = {
        userId: interaction.user.id,
        username: interaction.user.username,
        expenseItem,
        amount: Number(amount),
        notes,
        timestamp: now.toISOString(),
        approvedBy: [],
        threadMessageId: null
      };

      const threadMessage = await thread.send(
        `**経費申請**\n- 名前: <@${interaction.user.id}>\n- 経費項目: ${expenseItem}\n- 金額: ${amount} 円\n- 備考: ${notes}`
      );

      entry.threadMessageId = threadMessage.id;
      await appendExpenseLog(guildId, yearMonth, entry);

      await interaction.channel.send(
        `経費申請しました。　${formattedDate}　${interaction.member?.displayName || interaction.user.username} (<@${interaction.user.id}>)　${threadMessage.url}`
      );

      await interaction.editReply('経費申請を受け付けました。ありがとうございます。');
      return;
    }

    // 履歴確認モーダル（旧：expenseHistoryModal）は不要

    // ✅ 選択メニューから履歴表示
    if (interaction.isStringSelectMenu() && interaction.customId === 'select_expense_history') {
      if (interaction.replied || interaction.deferred) return;

      await interaction.deferReply({ ephemeral: true });

      const yearMonth = interaction.values[0];
      const userId = interaction.user.id;
      const guildId = interaction.guildId;

      const entries = getExpenseEntries(guildId, yearMonth, userId);
      if (entries.length === 0) {
        return await interaction.editReply('申請履歴が見つかりませんでした。');
      }

      const approverRoles = getApproverRoles(guildId);
      const memberList = await interaction.guild.members.fetch();
      const approverIds = memberList.filter(m =>
        approverRoles.some(r => m.roles.cache.has(r))
      ).map(m => m.user.id);

      const lines = entries.map(entry => {
        const date = new Date(entry.timestamp).toLocaleDateString('ja-JP');
        const approved = (entry.approvedBy || []).filter(a => approverIds.includes(a.userId)).length;
        const total = approverIds.length;
        return `📅 ${date}｜📌 ${entry.expenseItem}｜💴 ${entry.amount}円｜✅ 承認状況: ${approved}/${total}`;
      });

      const thread = await interaction.channel.threads.create({
        name: `申請履歴-${interaction.user.username}`,
        autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
        reason: '経費申請履歴確認'
      });

      await thread.send(`<@${userId}> さんの履歴：\n${lines.join('\n')}`);

      try {
        const spreadsheetId = await writeExpensesToSpreadsheet(guildId, yearMonth, entries);
        const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
        await thread.send(`📄 スプレッドシート出力:\n${url}`);
      } catch (err) {
        console.error('スプレッドシート出力エラー:', err);
        await thread.send('⚠️ スプレッドシート出力に失敗しました。');
      }

      await interaction.editReply(`✅ 履歴を以下のスレッドに表示しました：\n${thread.url}`);
    }
  }
};
