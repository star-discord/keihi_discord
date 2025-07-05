// commands/star_chat_gpt設定.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star_chat_gpt設定')
    .setDescription('ChatGPTの応答設定をします')
    .addStringOption(option =>
      option.setName('system')
        .setDescription('Systemプロンプト')
        .setRequired(true)),
  async execute(interaction) {
    const systemPrompt = interaction.options.getString('system');
    const fs = require('fs');
    fs.writeFileSync('./data/gpt_system_prompt.txt', systemPrompt);
    await interaction.reply({ content: '✅ 応答設定を保存しました。', ephemeral: true });
  }
};
