/**
 * Unit tests for petition.controller.js
 *
 * Covers: getTrendingPetition, getWeeklyPetition, getPetitionsByTopic,
 * createPetition (validation), getPetition (found/not found), signPetition.
 */

jest.mock('../../db/pool');
jest.mock('../../services/petition.service');

const pool            = require('../../db/pool');
const petitionService = require('../../services/petition.service');
const controller      = require('../petition.controller');

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => jest.clearAllMocks());

/* ════════════════════════════════════════════════════════════════
   getTrendingPetition
════════════════════════════════════════════════════════════════ */

describe('getTrendingPetition', () => {
  test('returns trending petition rows', async () => {
    const rows = [{ id: 1, title: 'Save the bees' }];
    pool.query.mockResolvedValue({ rows });

    const req = { user: { id: 1 } };
    const res = makeRes();
    await controller.getTrendingPetition(req, res);

    expect(res.json).toHaveBeenCalledWith(rows);
  });

  test('returns 500 on DB error', async () => {
    pool.query.mockRejectedValue(new Error('db down'));

    const req = { user: { id: 1 } };
    const res = makeRes();
    await controller.getTrendingPetition(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

/* ════════════════════════════════════════════════════════════════
   getWeeklyPetition
════════════════════════════════════════════════════════════════ */

describe('getWeeklyPetition', () => {
  test('returns weekly petition when found', async () => {
    const row = { id: 2, title: 'Weekly petition' };
    pool.query.mockResolvedValue({ rows: [row] });

    const req = { user: { id: 1 } };
    const res = makeRes();
    await controller.getWeeklyPetition(req, res);

    expect(res.json).toHaveBeenCalledWith(row);
  });

  test('returns null when no weekly petition exists', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const req = { user: { id: 1 } };
    const res = makeRes();
    await controller.getWeeklyPetition(req, res);

    expect(res.json).toHaveBeenCalledWith(null);
  });

  test('returns 500 on DB error', async () => {
    pool.query.mockRejectedValue(new Error('db down'));

    const req = { user: { id: 1 } };
    const res = makeRes();
    await controller.getWeeklyPetition(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

/* ════════════════════════════════════════════════════════════════
   getPetitionsByTopic
════════════════════════════════════════════════════════════════ */

describe('getPetitionsByTopic', () => {
  test('returns petitions for a valid topic', async () => {
    const rows = [{ id: 1, title: 'Petition A' }];
    pool.query.mockResolvedValue({ rows });

    const req = { user: { id: 1 }, params: { id: '3' } };
    const res = makeRes();
    await controller.getPetitionsByTopic(req, res);

    expect(res.json).toHaveBeenCalledWith(rows);
  });

  test('returns 400 for non-numeric topic ID', async () => {
    const req = { user: { id: 1 }, params: { id: 'abc' } };
    const res = makeRes();
    await controller.getPetitionsByTopic(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 500 on DB error', async () => {
    pool.query.mockRejectedValue(new Error('fail'));

    const req = { user: { id: 1 }, params: { id: '3' } };
    const res = makeRes();
    await controller.getPetitionsByTopic(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

/* ════════════════════════════════════════════════════════════════
   createPetition — validation
════════════════════════════════════════════════════════════════ */

describe('createPetition', () => {
  const validBody = {
    title: 'Save the parks',
    description: 'Please keep parks open',
    required_verification_tier: 2,
    signature_goal: 1000,
  };

  test('returns 201 with petition id on valid input', async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 99 }] });

    const req = { body: validBody };
    const res = makeRes();
    await controller.createPetition(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 99 });
  });

  test('returns 400 when title is missing', async () => {
    const req = { body: { ...validBody, title: '' } };
    const res = makeRes();
    await controller.createPetition(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 400 when description is missing', async () => {
    const req = { body: { ...validBody, description: '' } };
    const res = makeRes();
    await controller.createPetition(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 400 for invalid verification tier (must be 2 or 3)', async () => {
    const req = { body: { ...validBody, required_verification_tier: 1 } };
    const res = makeRes();
    await controller.createPetition(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringMatching(/tier/i) }));
  });

  test('returns 400 for zero signature goal', async () => {
    const req = { body: { ...validBody, signature_goal: 0 } };
    const res = makeRes();
    await controller.createPetition(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 400 for negative signature goal', async () => {
    const req = { body: { ...validBody, signature_goal: -5 } };
    const res = makeRes();
    await controller.createPetition(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 500 on DB error', async () => {
    pool.query.mockRejectedValue(new Error('db crash'));

    const req = { body: validBody };
    const res = makeRes();
    await controller.createPetition(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

/* ════════════════════════════════════════════════════════════════
   getPetition
════════════════════════════════════════════════════════════════ */

describe('getPetition', () => {
  test('returns petition when found', async () => {
    const row = { id: 1, title: 'A petition', signatures: 50 };
    pool.query.mockResolvedValue({ rows: [row] });

    const req = { user: { id: 1 }, params: { id: '1' } };
    const res = makeRes();
    await controller.getPetition(req, res);

    expect(res.json).toHaveBeenCalledWith(row);
  });

  test('returns 404 when petition does not exist', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const req = { user: { id: 1 }, params: { id: '9999' } };
    const res = makeRes();
    await controller.getPetition(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('returns 500 on DB error', async () => {
    pool.query.mockRejectedValue(new Error('fail'));

    const req = { user: { id: 1 }, params: { id: '1' } };
    const res = makeRes();
    await controller.getPetition(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

/* ════════════════════════════════════════════════════════════════
   signPetition
════════════════════════════════════════════════════════════════ */

describe('signPetition', () => {
  test('delegates to petitionService and returns result', async () => {
    petitionService.signPetition.mockResolvedValue({ success: true });

    const req = { user: { id: 1 }, params: { id: '5' } };
    const res = makeRes();
    await controller.signPetition(req, res);

    expect(petitionService.signPetition).toHaveBeenCalledWith({ userId: 1, petitionId: 5 });
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  test('returns 400 for invalid petition ID', async () => {
    const req = { user: { id: 1 }, params: { id: 'abc' } };
    const res = makeRes();
    await controller.signPetition(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns service error status when service throws', async () => {
    const err = Object.assign(new Error('Already signed'), { status: 409 });
    petitionService.signPetition.mockRejectedValue(err);

    const req = { user: { id: 1 }, params: { id: '5' } };
    const res = makeRes();
    await controller.signPetition(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'Already signed' });
  });

  test('returns 400 when service throws without a status', async () => {
    petitionService.signPetition.mockRejectedValue(new Error('Insufficient verification level'));

    const req = { user: { id: 1 }, params: { id: '5' } };
    const res = makeRes();
    await controller.signPetition(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
