# 公式Node.jsイメージをベースにする（バージョンは必要に応じて調整）
FROM node:18-slim

# 作業ディレクトリ作成
WORKDIR /usr/src/app

# 依存関係のインストール
COPY package*.json ./
RUN npm install --production

# アプリケーションのソースコードをコピー
COPY . .

# 環境変数で指定するポートを設定（Cloud Runが使う）
ENV PORT=3000

# アプリ起動コマンド
CMD ["node", "index.js"]

# もし他のファイル名なら適宜変更してください
