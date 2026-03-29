/**
 * Unit tests for topic.controller.js
 *
 * Covers: getTopics (happy path, empty result, DB error).
 */

jest.mock('../../db/pool');

const pool       = require('../../db/pool');
const controller = require('../topic.controller');

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => jest.clearAllMocks());

describe('getTopics', () => {
  test('returns all topics', async () => {
    const rows = [
      { id: 1, title: 'Housing', description: 'Housing issues', source: 'community' },
      { id: 2, title: 'Weekly',  description: 'This week',      source: 'weekly' },
    ];
    pool.query.mockResolvedValue({ rows });

    const res = makeRes();
    await controller.getTopics({}, res);

    expect(res.json).toHaveBeenCalledWith(rows);
  });

  test('returns empty array when no topics exist', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const res = makeRes();
    await controller.getTopics({}, res);

    expect(res.json).toHaveBeenCalledWith([]);
  });

  test('returns 500 on DB error', async () => {
    pool.query.mockRejectedValue(new Error('connection lost'));

    const res = makeRes();
    await controller.getTopics({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
