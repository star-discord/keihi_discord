const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('star_chat_gpt設置')
    .setDescription('ChatGPTが反応するトリガーを設定します')
    .addStringOption(option =>
      option.setName('トリガー')
        .setDescription('ChatGPTが反応する単語またはメンション')
        .setRequired(true)
    ),
  async execute(interaction) {
    const trigger = interaction.options.getString('トリガー');
    const configPath = path.resolve(__dirname, '../data/gpt_config.json');

    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }

    config.trigger = trigger;

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    await interaction.reply(`✅ ChatGPTのトリガーを「${trigger}」に設定しました。`);
  }
};
