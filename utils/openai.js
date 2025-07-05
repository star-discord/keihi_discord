// utils/openai.js
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function chatWithOpenAI(message) {
  let systemPrompt = 'あなたは有能なDiscord Botです。';

  try {
    const systemPath = path.resolve(__dirname, '../data/gpt_system_prompt.txt');
    if (fs.existsSync(systemPath)) {
      systemPrompt = fs.readFileSync(systemPath, 'utf8');
    }
  } catch (err) {
    console.warn('Systemプロンプト読み込み失敗:', err);
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ],
  });

  return response.choices[0].message.content.trim();
}

module.exports = { chatWithOpenAI };
