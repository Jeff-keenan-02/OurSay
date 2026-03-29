/**
 * Unit tests for analytics.controller.js
 *
 * Covers: getPolls, getPollResults (yes/no split + percentages),
 * getPollGroupResults, getPetitions, getPetitionResults (goal/progress/remaining).
 */

jest.mock('../../db/pool');

const pool       = require('../../db/pool');
const controller = require('../analytics.controller');

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => jest.clearAllMocks());

/* ════════════════════════════════════════════════════════════════
   getPolls
════════════════════════════════════════════════════════════════ */

describe('getPolls', () => {
  test('returns list of poll groups', async () => {
    const rows = [{ id: 1, title: 'Group A', respondent_count: '20' }];
    pool.query.mockResolvedValue({ rows });

    const res = makeRes();
    await controller.getPolls({}, res);

    expect(res.json).toHaveBeenCalledWith(rows);
  });

  test('returns 500 on DB error', async () => {
    pool.query.mockRejectedValue(new Error('fail'));

    const res = makeRes();
    await controller.getPolls({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

/* ════════════════════════════════════════════════════════════════
   getPollResults
════════════════════════════════════════════════════════════════ */

describe('getPollResults', () => {
  test('returns correct yes/no split and percentages', async () => {
    pool.query.mockResolvedValue({
      rows: [
        { choice: 'yes', count: '75' },
        { choice: 'no',  count: '25' },
      ],
    });

    const req = { params: { pollId: '1' } };
    const res = makeRes();
    await controller.getPollResults(req, res);

    const body = res.json.mock.calls[0][0];
    expect(body.totalVotes).toBe(100);
    expect(body.results[0]).toMatchObject({ label: 'Yes', count: 75, percentage: 75 });
    expect(body.results[1]).toMatchObject({ label: 'No',  count: 25, percentage: 25 });
  });

  test('returns 0% for both when no votes exist', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const req = { params: { pollId: '1' } };
    const res = makeRes();
    await controller.getPollResults(req, res);

    const body = res.json.mock.calls[0][0];
    expect(body.totalVotes).toBe(0);
    expect(body.results[0].percentage).toBe(0);
    expect(body.results[1].percentage).toBe(0);
  });

  test('returns 500 on DB error', async () => {
    pool.query.mockRejectedValue(new Error('fail'));

    const req = { params: { pollId: '1' } };
    const res = makeRes();
    await controller.getPollResults(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

/* ════════════════════════════════════════════════════════════════
   getPollGroupResults
════════════════════════════════════════════════════════════════ */

describe('getPollGroupResults', () => {
  test('returns group with per-poll results', async () => {
    // 1st call: polls in group, 2nd call: group title, 3rd call: votes for poll 1
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1, question: 'Do you agree?' }] })
      .mockResolvedValueOnce({ rows: [{ title: 'My Group' }] })
      .mockResolvedValueOnce({ rows: [{ choice: 'yes', count: '60' }, { choice: 'no', count: '40' }] });

    const req = { params: { groupId: '1' } };
    const res = makeRes();
    await controller.getPollGroupResults(req, res);

    const body = res.json.mock.calls[0][0];
    expect(body.groupTitle).toBe('My Group');
    expect(body.polls).toHaveLength(1);
    expect(body.polls[0].totalVotes).toBe(100);
    expect(body.polls[0].results[0]).toMatchObject({ label: 'Yes', count: 60, percentage: 60 });
  });

  test('returns empty polls array when group has no polls', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ title: 'Empty Group' }] });

    const req = { params: { groupId: '2' } };
    const res = makeRes();
    await controller.getPollGroupResults(req, res);

    const body = res.json.mock.calls[0][0];
    expect(body.polls).toHaveLength(0);
  });

  test('returns 500 on DB error', async () => {
    pool.query.mockRejectedValue(new Error('fail'));

    const req = { params: { groupId: '1' } };
    const res = makeRes();
    await controller.getPollGroupResults(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

/* ════════════════════════════════════════════════════════════════
   getPetitions
════════════════════════════════════════════════════════════════ */

describe('getPetitions', () => {
  test('returns list of petitions', async () => {
    const rows = [{ id: 1, title: 'Petition A', signatures: '100' }];
    pool.query.mockResolvedValue({ rows });

    const res = makeRes();
    await controller.getPetitions({}, res);

    expect(res.json).toHaveBeenCalledWith(rows);
  });

  test('returns 500 on DB error', async () => {
    pool.query.mockRejectedValue(new Error('fail'));

    const res = makeRes();
    await controller.getPetitions({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

/* ════════════════════════════════════════════════════════════════
   getPetitionResults
════════════════════════════════════════════════════════════════ */

describe('getPetitionResults', () => {
  test('returns correct progress and remaining', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ count: '750' }] })         // signatures
      .mockResolvedValueOnce({ rows: [{ signature_goal: 1000 }] }); // goal

    const req = { params: { petitionId: '1' } };
    const res = makeRes();
    await controller.getPetitionResults(req, res);

    const body = res.json.mock.calls[0][0];
    expect(body.totalSignatures).toBe(750);
    expect(body.goal).toBe(1000);
    expect(body.percentage).toBe(75);
    expect(body.remaining).toBe(250);
  });

  test('returns 0 percentage when goal is 0', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ count: '0' }] })
      .mockResolvedValueOnce({ rows: [{ signature_goal: 0 }] });

    const req = { params: { petitionId: '1' } };
    const res = makeRes();
    await controller.getPetitionResults(req, res);

    const body = res.json.mock.calls[0][0];
    expect(body.percentage).toBe(0);
  });

  test('remaining is 0 when signatures exceed goal', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ count: '1200' }] })
      .mockResolvedValueOnce({ rows: [{ signature_goal: 1000 }] });

    const req = { params: { petitionId: '1' } };
    const res = makeRes();
    await controller.getPetitionResults(req, res);

    const body = res.json.mock.calls[0][0];
    expect(body.remaining).toBe(0);
  });

  test('returns 500 on DB error', async () => {
    pool.query.mockRejectedValue(new Error('fail'));

    const req = { params: { petitionId: '1' } };
    const res = makeRes();
    await controller.getPetitionResults(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
