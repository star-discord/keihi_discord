// commands/star_chat_gpt設定.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star_chat_gpt設定')
    .setDescription('STAR ChatGPT の設定を表示または変更します'),
  async execute(interaction) {
    await interaction.reply('設定コマンドは現在準備中です。');
  }
};
