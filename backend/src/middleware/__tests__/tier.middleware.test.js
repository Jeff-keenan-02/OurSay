/**
 * Unit tests for tier.middleware.js (requireTier)
 *
 * Covers: sufficient tier, insufficient tier, unauthenticated request,
 * exact boundary values, and DB error handling.
 */

jest.mock('../../db/pool');

const pool         = require('../../db/pool');
const requireTier  = require('../tier.middleware');

/* ─── helpers ────────────────────────────────────────────────── */

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

function makeReq(userId = 1) {
  return { user: { id: userId } };
}

function mockTier(tier) {
  pool.query.mockResolvedValue({ rows: [{ tier }] });
}

beforeEach(() => jest.clearAllMocks());

/* ════════════════════════════════════════════════════════════════
   Sufficient tier — next() is called
════════════════════════════════════════════════════════════════ */

describe('requireTier — sufficient tier', () => {
  test('calls next() when user tier equals required tier', async () => {
    mockTier(2);
    const next = jest.fn();

    await requireTier(2)(makeReq(), makeRes(), next);

    expect(next).toHaveBeenCalled();
  });

  test('calls next() when user tier exceeds required tier', async () => {
    mockTier(3);
    const next = jest.fn();

    await requireTier(2)(makeReq(), makeRes(), next);

    expect(next).toHaveBeenCalled();
  });

  test('calls next() for tier 1 route with tier 1 user', async () => {
    mockTier(1);
    const next = jest.fn();

    await requireTier(1)(makeReq(), makeRes(), next);

    expect(next).toHaveBeenCalled();
  });
});

/* ════════════════════════════════════════════════════════════════
   Insufficient tier — 403 returned
════════════════════════════════════════════════════════════════ */

describe('requireTier — insufficient tier', () => {
  test('returns 403 when user tier is below required', async () => {
    mockTier(1);
    const res  = makeRes();
    const next = jest.fn();

    await requireTier(2)(makeReq(), res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 403 when unverified user (tier 0) hits a tier-2 route', async () => {
    mockTier(0);
    const res  = makeRes();

    await requireTier(2)(makeReq(), res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('response includes requiredTier and currentTier fields', async () => {
    mockTier(1);
    const res = makeRes();

    await requireTier(3)(makeReq(), res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      requiredTier: 3,
      currentTier: 1,
    }));
  });

  test('tier 2 user blocked from tier-3 route', async () => {
    mockTier(2);
    const res  = makeRes();
    const next = jest.fn();

    await requireTier(3)(makeReq(), res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

/* ════════════════════════════════════════════════════════════════
   Unauthenticated request (no req.user)
════════════════════════════════════════════════════════════════ */

describe('requireTier — unauthenticated request', () => {
  test('returns 401 when req.user is undefined', async () => {
    const req  = {};           // no user property
    const res  = makeRes();
    const next = jest.fn();

    await requireTier(2)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('does not query the DB when req.user is missing', async () => {
    const req = {};
    const res = makeRes();

    await requireTier(2)(req, res, jest.fn());

    expect(pool.query).not.toHaveBeenCalled();
  });
});

/* ════════════════════════════════════════════════════════════════
   DB error handling
════════════════════════════════════════════════════════════════ */

describe('requireTier — DB errors', () => {
  test('returns 500 when the DB query throws', async () => {
    pool.query.mockRejectedValue(new Error('connection lost'));
    const res  = makeRes();
    const next = jest.fn();

    await requireTier(2)(makeReq(), res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(next).not.toHaveBeenCalled();
  });

  test('does not call next() on DB error', async () => {
    pool.query.mockRejectedValue(new Error('timeout'));
    const next = jest.fn();

    await requireTier(2)(makeReq(), makeRes(), next);

    expect(next).not.toHaveBeenCalled();
  });
});

/* ════════════════════════════════════════════════════════════════
   SQL query guards
════════════════════════════════════════════════════════════════ */

describe('requireTier — query guards', () => {
  test('SQL filters out revoked verifications', async () => {
    mockTier(2);
    await requireTier(2)(makeReq(), makeRes(), jest.fn());

    const [sql] = pool.query.mock.calls[0];
    expect(sql).toMatch(/revoked\s*=\s*false/i);
  });

  test('SQL filters out expired verifications', async () => {
    mockTier(2);
    await requireTier(2)(makeReq(), makeRes(), jest.fn());

    const [sql] = pool.query.mock.calls[0];
    expect(sql).toMatch(/expires_at\s*>/i);
  });
});
