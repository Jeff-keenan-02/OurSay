/**
 * Unit tests for discussion.controller.js
 *
 * Covers: getWeeklyDiscussion, getDisscussionByTopic, getDiscussion (found/not found/comments),
 * getTrending, postComment (validation + tier snapshot), createDiscussion (validation),
 * voteDiscussion (direction validation + upsert).
 */

jest.mock('../../db/pool');

const pool       = require('../../db/pool');
const controller = require('../discussion.controller');

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => jest.clearAllMocks());

/* ════════════════════════════════════════════════════════════════
   getWeeklyDiscussion
════════════════════════════════════════════════════════════════ */

describe('getWeeklyDiscussion', () => {
  test('returns the weekly discussion row', async () => {
    const row = { id: 1, title: 'Weekly topic', comment_count: 5 };
    pool.query.mockResolvedValue({ rows: [row] });

    const res = makeRes();
    await controller.getWeeklyDiscussion({}, res);

    expect(res.json).toHaveBeenCalledWith(row);
  });

  test('returns null when no weekly discussion', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const res = makeRes();
    await controller.getWeeklyDiscussion({}, res);

    expect(res.json).toHaveBeenCalledWith(null);
  });

  test('returns 500 on DB error', async () => {
    pool.query.mockRejectedValue(new Error('fail'));

    const res = makeRes();
    await controller.getWeeklyDiscussion({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

/* ════════════════════════════════════════════════════════════════
   getDisscussionByTopic
════════════════════════════════════════════════════════════════ */

describe('getDisscussionByTopic', () => {
  test('returns discussions for a topic', async () => {
    const rows = [{ id: 1, title: 'Discussion A' }];
    pool.query.mockResolvedValue({ rows });

    const req = { params: { topicId: '3' } };
    const res = makeRes();
    await controller.getDisscussionByTopic(req, res);

    expect(res.json).toHaveBeenCalledWith(rows);
  });

  test('returns 500 on DB error', async () => {
    pool.query.mockRejectedValue(new Error('fail'));

    const req = { params: { topicId: '3' } };
    const res = makeRes();
    await controller.getDisscussionByTopic(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

/* ════════════════════════════════════════════════════════════════
   getDiscussion
════════════════════════════════════════════════════════════════ */

describe('getDiscussion', () => {
  test('returns discussion with comments when found', async () => {
    const discussion = { id: 1, title: 'A discussion', upvotes: 3, downvotes: 1 };
    const comments   = [{ id: 10, body: 'Nice post' }];
    pool.query
      .mockResolvedValueOnce({ rowCount: 1, rows: [discussion] })
      .mockResolvedValueOnce({ rows: comments });

    const req = { params: { id: '1' } };
    const res = makeRes();
    await controller.getDiscussion(req, res);

    expect(res.json).toHaveBeenCalledWith({ ...discussion, comments });
  });

  test('returns 404 when discussion does not exist', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const req = { params: { id: '999' } };
    const res = makeRes();
    await controller.getDiscussion(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('returns 500 on DB error', async () => {
    pool.query.mockRejectedValue(new Error('fail'));

    const req = { params: { id: '1' } };
    const res = makeRes();
    await controller.getDiscussion(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

/* ════════════════════════════════════════════════════════════════
   getTrending
════════════════════════════════════════════════════════════════ */

describe('getTrending', () => {
  test('returns trending discussions', async () => {
    const rows = [{ id: 1, upvotes: 10 }, { id: 2, upvotes: 5 }];
    pool.query.mockResolvedValue({ rows });

    const res = makeRes();
    await controller.getTrending({}, res);

    expect(res.json).toHaveBeenCalledWith(rows);
  });

  test('returns 500 on DB error', async () => {
    pool.query.mockRejectedValue(new Error('fail'));

    const res = makeRes();
    await controller.getTrending({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

/* ════════════════════════════════════════════════════════════════
   postComment
════════════════════════════════════════════════════════════════ */

describe('postComment', () => {
  test('returns 201 with comment on valid input', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ tier: 2 }] }) // user effective tier (live query)
      .mockResolvedValueOnce({ rows: [{ id: 50, body: 'Hello', created_at: new Date(), verification_tier: 2 }] });

    const req = { user: { id: 1 }, params: { id: '10' }, body: { body: 'Hello' } };
    const res = makeRes();
    await controller.postComment(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('returns 400 when comment body is empty', async () => {
    const req = { user: { id: 1 }, params: { id: '10' }, body: { body: '' } };
    const res = makeRes();
    await controller.postComment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 400 when comment body is whitespace only', async () => {
    const req = { user: { id: 1 }, params: { id: '10' }, body: { body: '   ' } };
    const res = makeRes();
    await controller.postComment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('snapshots user verification tier into the comment row', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ tier: 3 }] }) // user effective tier (live query)
      .mockResolvedValueOnce({ rows: [{ id: 51, body: 'Hello', created_at: new Date(), verification_tier: 3 }] });

    const req = { user: { id: 1 }, params: { id: '10' }, body: { body: 'Hello' } };
    const res = makeRes();
    await controller.postComment(req, res);

    // Second call inserts the comment — tier 3 must be in params
    const insertParams = pool.query.mock.calls[1][1];
    expect(insertParams).toContain(3);
  });

  test('returns 500 on DB error', async () => {
    pool.query.mockRejectedValue(new Error('fail'));

    const req = { user: { id: 1 }, params: { id: '10' }, body: { body: 'Hello' } };
    const res = makeRes();
    await controller.postComment(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

/* ════════════════════════════════════════════════════════════════
   createDiscussion
════════════════════════════════════════════════════════════════ */

describe('createDiscussion', () => {
  test('returns 201 with created discussion', async () => {
    const row = { id: 1, title: 'My discussion', body: 'Some text', created_at: new Date() };
    pool.query.mockResolvedValue({ rows: [row] });

    const req = { user: { id: 1 }, body: { title: 'My discussion', body: 'Some text' } };
    const res = makeRes();
    await controller.createDiscussion(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(row);
  });

  test('returns 400 when title is missing', async () => {
    const req = { user: { id: 1 }, body: { body: 'Some text' } };
    const res = makeRes();
    await controller.createDiscussion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 400 when body is missing', async () => {
    const req = { user: { id: 1 }, body: { title: 'My discussion' } };
    const res = makeRes();
    await controller.createDiscussion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 400 when title exceeds 255 characters', async () => {
    const req = { user: { id: 1 }, body: { title: 'A'.repeat(256), body: 'Some text' } };
    const res = makeRes();
    await controller.createDiscussion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 500 on DB error', async () => {
    pool.query.mockRejectedValue(new Error('fail'));

    const req = { user: { id: 1 }, body: { title: 'My discussion', body: 'Some text' } };
    const res = makeRes();
    await controller.createDiscussion(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

/* ════════════════════════════════════════════════════════════════
   voteDiscussion
════════════════════════════════════════════════════════════════ */

describe('voteDiscussion', () => {
  test('returns updated vote counts for "up"', async () => {
    pool.query
      .mockResolvedValueOnce({}) // upsert
      .mockResolvedValueOnce({ rows: [{ upvotes: 5, downvotes: 2 }] });

    const req = { user: { id: 1 }, params: { id: '10' }, body: { direction: 'up' } };
    const res = makeRes();
    await controller.voteDiscussion(req, res);

    expect(res.json).toHaveBeenCalledWith({ id: 10, upvotes: 5, downvotes: 2 });
  });

  test('returns updated vote counts for "down"', async () => {
    pool.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ upvotes: 1, downvotes: 8 }] });

    const req = { user: { id: 1 }, params: { id: '10' }, body: { direction: 'down' } };
    const res = makeRes();
    await controller.voteDiscussion(req, res);

    expect(res.json).toHaveBeenCalledWith({ id: 10, upvotes: 1, downvotes: 8 });
  });

  test('returns 400 for invalid direction', async () => {
    const req = { user: { id: 1 }, params: { id: '10' }, body: { direction: 'sideways' } };
    const res = makeRes();
    await controller.voteDiscussion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringMatching(/up.*down|down.*up/i) }));
  });

  test('upserts vote — same user voting twice changes not duplicates', async () => {
    pool.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ upvotes: 1, downvotes: 0 }] });

    const req = { user: { id: 1 }, params: { id: '10' }, body: { direction: 'up' } };
    const res = makeRes();
    await controller.voteDiscussion(req, res);

    const upsertSql = pool.query.mock.calls[0][0];
    expect(upsertSql).toMatch(/ON CONFLICT/i);
  });

  test('returns 500 on DB error', async () => {
    pool.query.mockRejectedValue(new Error('fail'));

    const req = { user: { id: 1 }, params: { id: '10' }, body: { direction: 'up' } };
    const res = makeRes();
    await controller.voteDiscussion(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
