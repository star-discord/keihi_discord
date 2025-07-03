# Node.js公式イメージをベースにする
FROM node:18

# 作業ディレクトリの作成
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係のインストール
RUN npm install

# アプリ本体をコピー
COPY . .

# 環境変数を渡すポートを明示（Render/GCP向け）
ENV PORT=3000

# アプリ起動
CMD ["npm", "start"]
