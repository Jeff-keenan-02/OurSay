/**
 * Unit tests for poll.controller.js
 *
 * Covers: getWeeklyPoll, getTrendingPoll, getPollGroupsByTopic,
 * getPollsByGroup (tier gate), votePoll (input + service delegation).
 */

jest.mock('../../db/pool');
jest.mock('../../services/poll.service');
jest.mock('../../services/verification.service');

const pool                = require('../../db/pool');
const pollService         = require('../../services/poll.service');
const verificationService = require('../../services/verification.service');
const controller          = require('../poll.controller');

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => jest.clearAllMocks());

/* ════════════════════════════════════════════════════════════════
   getWeeklyPoll
════════════════════════════════════════════════════════════════ */

describe('getWeeklyPoll', () => {
  test('returns the weekly poll row', async () => {
    const row = { id: 1, title: 'Weekly Poll', required_verification_tier: 1 };
    pool.query.mockResolvedValue({ rows: [row] });

    const req = { user: { id: 10 } };
    const res = makeRes();
    await controller.getWeeklyPoll(req, res);

    expect(res.json).toHaveBeenCalledWith(row);
  });

  test('returns null when no weekly poll exists', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const req = { user: { id: 10 } };
    const res = makeRes();
    await controller.getWeeklyPoll(req, res);

    expect(res.json).toHaveBeenCalledWith(null);
  });

  test('returns 500 on DB error', async () => {
    pool.query.mockRejectedValue(new Error('db down'));

    const req = { user: { id: 10 } };
    const res = makeRes();
    await controller.getWeeklyPoll(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

/* ════════════════════════════════════════════════════════════════
   getTrendingPoll
════════════════════════════════════════════════════════════════ */

describe('getTrendingPoll', () => {
  test('returns array of trending polls', async () => {
    const rows = [{ id: 1 }, { id: 2 }];
    pool.query.mockResolvedValue({ rows });

    const req = { user: { id: 1 } };
    const res = makeRes();
    await controller.getTrendingPoll(req, res);

    expect(res.json).toHaveBeenCalledWith(rows);
  });

  test('returns 500 on DB error', async () => {
    pool.query.mockRejectedValue(new Error('fail'));

    const req = { user: { id: 1 } };
    const res = makeRes();
    await controller.getTrendingPoll(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

/* ════════════════════════════════════════════════════════════════
   getPollGroupsByTopic
════════════════════════════════════════════════════════════════ */

describe('getPollGroupsByTopic', () => {
  test('returns poll groups for a valid topic', async () => {
    const rows = [{ id: 1, title: 'Group A' }];
    pool.query.mockResolvedValue({ rows });

    const req = { user: { id: 1 }, params: { topicId: '5' } };
    const res = makeRes();
    await controller.getPollGroupsByTopic(req, res);

    expect(res.json).toHaveBeenCalledWith(rows);
  });

  test('returns 400 for non-numeric topicId', async () => {
    const req = { user: { id: 1 }, params: { topicId: 'abc' } };
    const res = makeRes();
    await controller.getPollGroupsByTopic(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 500 on DB error', async () => {
    pool.query.mockRejectedValue(new Error('fail'));

    const req = { user: { id: 1 }, params: { topicId: '5' } };
    const res = makeRes();
    await controller.getPollGroupsByTopic(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

/* ════════════════════════════════════════════════════════════════
   getPollsByGroup — tier gate
════════════════════════════════════════════════════════════════ */

describe('getPollsByGroup', () => {
  test('returns polls when user meets required tier', async () => {
    verificationService.getVotingIdentity.mockResolvedValue({ effectiveTier: 2 });
    pool.query
      .mockResolvedValueOnce({ rows: [{ required_verification_tier: 2 }] })
      .mockResolvedValueOnce({ rows: [{ id: 1, question: 'Q1', has_voted: false }] });

    const req = { user: { id: 1 }, params: { pollGroupId: '3' } };
    const res = makeRes();
    await controller.getPollsByGroup(req, res);

    expect(res.json).toHaveBeenCalledWith([{ id: 1, question: 'Q1', has_voted: false }]);
  });

  test('returns 403 when user tier is below required', async () => {
    verificationService.getVotingIdentity.mockResolvedValue({ effectiveTier: 1 });
    pool.query.mockResolvedValueOnce({ rows: [{ required_verification_tier: 2 }] });

    const req = { user: { id: 1 }, params: { pollGroupId: '3' } };
    const res = makeRes();
    await controller.getPollsByGroup(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringMatching(/insufficient/i) }));
  });

  test('returns 404 when poll group does not exist', async () => {
    verificationService.getVotingIdentity.mockResolvedValue({ effectiveTier: 3 });
    pool.query.mockResolvedValueOnce({ rows: [] });

    const req = { user: { id: 1 }, params: { pollGroupId: '999' } };
    const res = makeRes();
    await controller.getPollsByGroup(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('returns 500 on DB error', async () => {
    verificationService.getVotingIdentity.mockRejectedValue(new Error('identity fail'));

    const req = { user: { id: 1 }, params: { pollGroupId: '3' } };
    const res = makeRes();
    await controller.getPollsByGroup(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

/* ════════════════════════════════════════════════════════════════
   votePoll
════════════════════════════════════════════════════════════════ */

describe('votePoll', () => {
  test('returns 400 for invalid choice', async () => {
    const req = { user: { id: 1 }, params: { id: '5' }, body: { choice: 'maybe' } };
    const res = makeRes();
    await controller.votePoll(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Invalid choice' }));
  });

  test('delegates to pollService and returns result', async () => {
    pollService.votePoll.mockResolvedValue({ success: true });

    const req = { user: { id: 1 }, params: { id: '5' }, body: { choice: 'yes' } };
    const res = makeRes();
    await controller.votePoll(req, res);

    expect(pollService.votePoll).toHaveBeenCalledWith({ userId: 1, pollId: 5, choice: 'yes' });
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  test('returns service error status when service throws with status', async () => {
    const err = Object.assign(new Error('Insufficient verification level'), { status: 403 });
    pollService.votePoll.mockRejectedValue(err);

    const req = { user: { id: 1 }, params: { id: '5' }, body: { choice: 'no' } };
    const res = makeRes();
    await controller.votePoll(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('returns 409 when service throws duplicate identity error', async () => {
    const err = Object.assign(new Error('This identity has already voted in this poll'), { status: 409 });
    pollService.votePoll.mockRejectedValue(err);

    const req = { user: { id: 1 }, params: { id: '5' }, body: { choice: 'yes' } };
    const res = makeRes();
    await controller.votePoll(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  test('userId comes from JWT not request body', async () => {
    pollService.votePoll.mockResolvedValue({ success: true });

    const req = { user: { id: 42 }, params: { id: '5' }, body: { choice: 'yes', userId: 99 } };
    const res = makeRes();
    await controller.votePoll(req, res);

    expect(pollService.votePoll).toHaveBeenCalledWith(expect.objectContaining({ userId: 42 }));
  });
});
