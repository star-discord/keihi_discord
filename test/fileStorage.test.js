const fs = require('fs');
const path = require('path');
const {
  appendExpenseLog,
  updateApprovalStatus
} = require('../utils/fileStorage');

const TEST_GUILD_ID = 'test-guild';
const TEST_YEAR_MONTH = '2025-07';
const TEST_DIR = path.join(__dirname, '..', 'data', 'keihi', TEST_GUILD_ID, 'logs');
const TEST_FILE = path.join(TEST_DIR, `${TEST_YEAR_MONTH}.json`);

function cleanup() {
  if (fs.existsSync(TEST_FILE)) {
    fs.unlinkSync(TEST_FILE);
  }
}

beforeEach(() => cleanup());
afterAll(() => cleanup());

describe('fileStorage.js', () => {
  test('appendExpenseLog correctly writes new entry', () => {
    const entry = {
      userId: 'user123',
      username: 'testuser',
      item: 'Test Item',
      amount: 12345,
      threadMessageId: 'thread123'
    };

    appendExpenseLog(TEST_GUILD_ID, TEST_YEAR_MONTH, entry);

    const data = JSON.parse(fs.readFileSync(TEST_FILE, 'utf8'));
    expect(data).toHaveLength(1);
    expect(data[0].username).toBe('testuser');
  });

  test('updateApprovalStatus adds approver only once', () => {
    const entry = {
      userId: 'user123',
      username: 'testuser',
      item: 'Test Item',
      amount: 12345,
      threadMessageId: 'thread123',
      approvedBy: []
    };
    fs.mkdirSync(TEST_DIR, { recursive: true });
    fs.writeFileSync(TEST_FILE, JSON.stringify([entry], null, 2));

    const result = updateApprovalStatus(TEST_GUILD_ID, TEST_YEAR_MONTH, 'thread123', 'approver1', 'Alice');
    expect(result).toHaveLength(1);
    expect(result[0].username).toBe('Alice');

    // 2回目は追加されない
    const again = updateApprovalStatus(TEST_GUILD_ID, TEST_YEAR_MONTH, 'thread123', 'approver1', 'Alice');
    expect(again).toHaveLength(1);
  });
});
