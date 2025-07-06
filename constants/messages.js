// constants/messages.js

const MESSAGES = {
  APPLY_SUCCESS: '✅ 経費申請を受け付けました。',
  APPLY_CANCELLED: '🚫 経費申請を取り消しました。',
  APPLY_TIMEOUT: '⏱️ モーダル入力がタイムアウトしました。',
  APPROVE_SUCCESS: (count, total, users) =>
    `✅ 承認済み (${count}/${total}): ${users.join(', ')}`,
  THREAD_NOT_FOUND: '⚠️ 対応するスレッドが見つかりませんでした。',
  NO_APPROVER_ROLE: '⚠️ 承認ロールが設定されていません。',
  NOT_TEXT_CHANNEL: 'このコマンドはテキストチャンネルでのみ使用できます。',
  HISTORY_FILE_NOT_FOUND: '📁 経費申請の履歴ファイルが見つかりませんでした。',
  HISTORY_SELECT_PROMPT: '📅 確認したい年月を選択してください：',
  ERROR_OCCURRED: '⚠️ エラーが発生しました。管理者にお問い合わせください。',
  APPROVER_ROLE_SET: (roleMentions) =>
    `✅ 承認ロールを設定しました：${roleMentions}`,
  APPROVER_ROLE_PROMPT: '✅ 承認ロールを選択してください（複数選択可）',
  APPROVER_ROLE_TIMEOUT: '⏱️ タイムアウトしました。もう一度コマンドを実行してください。',

  // スレッド関連
  THREAD_HEADER: '📋 経費申請をする場合は以下のボタンを押してください。\n承認者には「承認」ボタンが表示されます。',
};

module.exports = MESSAGES;
