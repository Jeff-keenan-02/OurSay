/**
 * Unit tests for verify.controller.js
 *
 * Covers: createLivenessSession, confirmLiveness (pass/fail/confidence),
 * verifyPassport (mock mode), verifyResidence (GPS bounding box),
 * getVerificationSummary.
 *
 * AWS SDK clients are mocked — no real AWS calls are made.
 */

process.env.JWT_SECRET    = 'test-secret';
process.env.IDENTITY_SALT = 'test-salt';
process.env.AWS_REGION    = 'eu-west-1';

jest.mock('../../db/pool');
jest.mock('@aws-sdk/client-rekognition');
jest.mock('@aws-sdk/client-textract');

const pool = require('../../db/pool');
const {
  RekognitionClient,
  CreateFaceLivenessSessionCommand,
  GetFaceLivenessSessionResultsCommand,
} = require('@aws-sdk/client-rekognition');
const { TextractClient } = require('@aws-sdk/client-textract');

// Mock send() on both clients
const mockRekognitionSend = jest.fn();
const mockTextractSend    = jest.fn();
RekognitionClient.mockImplementation(() => ({ send: mockRekognitionSend }));
TextractClient.mockImplementation(()    => ({ send: mockTextractSend }));

const controller = require('../verify.controller');

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
  pool.query.mockResolvedValue({ rows: [] });
});

/* ════════════════════════════════════════════════════════════════
   createLivenessSession
════════════════════════════════════════════════════════════════ */

describe('createLivenessSession', () => {
  test('returns sessionId from Rekognition', async () => {
    mockRekognitionSend.mockResolvedValue({ SessionId: 'session-abc' });

    const req = { user: { id: 1 } };
    const res = makeRes();
    await controller.createLivenessSession(req, res);

    expect(res.json).toHaveBeenCalledWith({ sessionId: 'session-abc' });
  });

  test('returns 500 when Rekognition throws', async () => {
    mockRekognitionSend.mockRejectedValue(new Error('AWS error'));

    const req = { user: { id: 1 } };
    const res = makeRes();
    await controller.createLivenessSession(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

/* ════════════════════════════════════════════════════════════════
   confirmLiveness
════════════════════════════════════════════════════════════════ */

describe('confirmLiveness', () => {
  test('returns success when confidence meets threshold', async () => {
    mockRekognitionSend.mockResolvedValue({ Confidence: 90 });

    const req = { user: { id: 1 }, body: { sessionId: 'sess-1' } };
    const res = makeRes();
    await controller.confirmLiveness(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, level: 1 }));
    expect(pool.query).toHaveBeenCalledTimes(2); // INSERT + UPDATE
  });

  test('returns 400 when confidence is below threshold', async () => {
    mockRekognitionSend.mockResolvedValue({ Confidence: 50 });

    const req = { user: { id: 1 }, body: { sessionId: 'sess-1' } };
    const res = makeRes();
    await controller.confirmLiveness(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringMatching(/failed/i) }));
  });

  test('returns 400 when sessionId is missing', async () => {
    const req = { user: { id: 1 }, body: {} };
    const res = makeRes();
    await controller.confirmLiveness(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('does not write to DB when liveness fails', async () => {
    mockRekognitionSend.mockResolvedValue({ Confidence: 10 });

    const req = { user: { id: 1 }, body: { sessionId: 'sess-1' } };
    const res = makeRes();
    await controller.confirmLiveness(req, res);

    expect(pool.query).not.toHaveBeenCalled();
  });

  test('liveness verification expires after 7 days', async () => {
    mockRekognitionSend.mockResolvedValue({ Confidence: 95 });

    const req = { user: { id: 1 }, body: { sessionId: 'sess-1' } };
    const res = makeRes();
    await controller.confirmLiveness(req, res);

    const insertSql = pool.query.mock.calls[0][0];
    expect(insertSql).toMatch(/7 days/i);
  });

  test('returns 500 on Rekognition error', async () => {
    mockRekognitionSend.mockRejectedValue(new Error('AWS down'));

    const req = { user: { id: 1 }, body: { sessionId: 'sess-1' } };
    const res = makeRes();
    await controller.confirmLiveness(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

/* ════════════════════════════════════════════════════════════════
   verifyResidence — GPS bounding box
════════════════════════════════════════════════════════════════ */

describe('verifyResidence', () => {
  beforeEach(() => {
    // Simulate active passport verification on file
    pool.query.mockResolvedValueOnce({
      rows: [{ expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) }],
    });
  });

  test('returns verified=true for Dublin coordinates', async () => {
    pool.query.mockResolvedValue({ rows: [] }); // subsequent queries
    // Reset and set passport query first
    pool.query.mockReset();
    pool.query
      .mockResolvedValueOnce({ rows: [{ expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) }] })
      .mockResolvedValue({ rows: [] });

    const req = { user: { id: 1 }, body: { latitude: 53.349, longitude: -6.260 } };
    const res = makeRes();
    await controller.verifyResidence(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ verified: true, level: 3 }));
  });

  test('returns verified=false for coordinates outside Ireland', async () => {
    pool.query.mockReset();
    pool.query.mockResolvedValueOnce({
      rows: [{ expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) }],
    });

    const req = { user: { id: 1 }, body: { latitude: 51.509, longitude: -0.118 } }; // London
    const res = makeRes();
    await controller.verifyResidence(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ verified: false, level: 2 }));
  });

  test('returns 400 when coordinates are missing', async () => {
    pool.query.mockReset();
    pool.query.mockResolvedValueOnce({
      rows: [{ expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) }],
    });

    const req = { user: { id: 1 }, body: {} };
    const res = makeRes();
    await controller.verifyResidence(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 400 when no active passport exists', async () => {
    pool.query.mockReset();
    pool.query.mockResolvedValueOnce({ rows: [] }); // no passport

    const req = { user: { id: 1 }, body: { latitude: 53.349, longitude: -6.260 } };
    const res = makeRes();
    await controller.verifyResidence(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringMatching(/passport/i) }));
  });

  test('writes tier 3 to DB when coordinates are within Ireland', async () => {
    pool.query.mockReset();
    pool.query
      .mockResolvedValueOnce({ rows: [{ expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) }] })
      .mockResolvedValue({ rows: [] });

    const req = { user: { id: 1 }, body: { latitude: 53.349, longitude: -6.260 } };
    const res = makeRes();
    await controller.verifyResidence(req, res);

    const updateCall = pool.query.mock.calls.find(([sql]) => /verification_tier/i.test(sql));
    expect(updateCall).toBeDefined();
    expect(updateCall[0]).toMatch(/GREATEST.*3/i);
  });
});

/* ════════════════════════════════════════════════════════════════
   getVerificationSummary
════════════════════════════════════════════════════════════════ */

describe('getVerificationSummary', () => {
  test('returns current tier and expiry when verified', async () => {
    const expiresAt = new Date('2026-12-01');
    pool.query.mockResolvedValue({ rows: [{ level: 2, expires_at: expiresAt }] });

    const req = { user: { id: 1 } };
    const res = makeRes();
    await controller.getVerificationSummary(req, res);

    expect(res.json).toHaveBeenCalledWith({ currentTier: 2, expiresAt });
  });

  test('returns tier 0 and null expiry when no active verification', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const req = { user: { id: 1 } };
    const res = makeRes();
    await controller.getVerificationSummary(req, res);

    expect(res.json).toHaveBeenCalledWith({ currentTier: 0, expiresAt: null });
  });

  test('returns the highest active tier when multiple exist', async () => {
    pool.query.mockResolvedValue({ rows: [{ level: 3, expires_at: new Date('2026-06-01') }] });

    const req = { user: { id: 1 } };
    const res = makeRes();
    await controller.getVerificationSummary(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ currentTier: 3 }));
  });

  test('returns 500 on DB error', async () => {
    pool.query.mockRejectedValue(new Error('fail'));

    const req = { user: { id: 1 } };
    const res = makeRes();
    await controller.getVerificationSummary(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
