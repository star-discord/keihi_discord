// utils/storage.js
const { Storage } = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage({
  keyFilename: path.join(__dirname, '../star-discord-bot-464919-7572775ad9ae.json'),
});

const bucketName = 'your-bucket-name'; // ← ここを実際のバケット名に置き換えてください

module.exports = {
  async uploadFile(localPath, destination) {
    await storage.bucket(bucketName).upload(localPath, {
      destination,
    });
  },

  async downloadFile(srcFilename, destPath) {
    const options = {
      destination: destPath,
    };
    await storage.bucket(bucketName).file(srcFilename).download(options);
  },

  async getFileContents(filename) {
    const contents = await storage.bucket(bucketName).file(filename).download();
    return contents[0].toString('utf8');
  },

  async saveFileContents(filename, contents) {
    await storage.bucket(bucketName).file(filename).save(contents);
  },
};
