// utils/initUtils.js
const fs = require('fs');
const path = require('path');

/**
 * 指定された guildId 用の data フォルダがなければ作成
 * @param {string} guildId
 */
function ensureDataFolder(guildId) {
  const guildPath = path.join(__dirname, '..', 'data', guildId);
  if (!fs.existsSync(guildPath)) {
    fs.mkdirSync(guildPath, { recursive: true });
    console.log(`📁 [init] data/${guildId} フォルダを作成しました`);
  }
}

/**
 * data/ 以下の JSON ファイルをすべて data_backup/ にバックアップ
 */
function backupDataFiles() {
  const dataDir = path.join(__dirname, '..', 'data');
  const backupDir = path.join(__dirname, '..', 'data_backup', getTodayString());

  if (!fs.existsSync(dataDir)) return;

  fs.mkdirSync(backupDir, { recursive: true });

  const copyFileRecursive = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(dataDir, fullPath);
      const destPath = path.join(backupDir, relativePath);

      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyFileRecursive(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        fs.copyFileSync(fullPath, destPath);
        console.log(`🗄️ バックアップ: ${relativePath}`);
      }
    }
  };

  copyFileRecursive(dataDir);
}

function getTodayString() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

module.exports = {
  ensureDataFolder,
  backupDataFiles,
};
