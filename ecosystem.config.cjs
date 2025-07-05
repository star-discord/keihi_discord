require('dotenv').config(); // ← 追加：.env を読み込む

module.exports = {
  apps: [
    {
      name: "keihi-bot",
      script: "./index.js",
      watch: false,
      env: {
        NODE_ENV: "production",
        DISCORD_TOKEN: process.env.DISCORD_TOKEN,
        CLIENT_ID: process.env.CLIENT_ID,
        GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        SPREADSHEET_ID: process.env.SPREADSHEET_ID,
        PORT: process.env.PORT || 3000
      }
    }
  ]
};
