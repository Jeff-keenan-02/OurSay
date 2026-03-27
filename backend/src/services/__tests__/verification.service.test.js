/**
 * Unit tests for verification.service.js — getVotingIdentity
 *
 * Covers: no records, single passport, single address,
 * multiple active records, expired/revoked exclusion, and
 * highest-tier selection logic.
 */

jest.mock('../../db/pool');

const pool                = require('../../db/pool');
const verificationService = require('../verification.service');

beforeEach(() => jest.clearAllMocks());

/* ════════════════════════════════════════════════════════════════
   getVotingIdentity — no active verifications
════════════════════════════════════════════════════════════════ */

describe('getVotingIdentity — no verifications', () => {
  test('returns tier 0 and null passportHash when user has no records', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const result = await verificationService.getVotingIdentity(1);

    expect(result).toEqual({ effectiveTier: 0, passportHash: null });
  });

  test('calls the DB with the correct userId', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    await verificationService.getVotingIdentity(42);

    expect(pool.query).toHaveBeenCalledWith(
      expect.any(String),
      [42]
    );
  });
});

/* ════════════════════════════════════════════════════════════════
   getVotingIdentity — passport verification
════════════════════════════════════════════════════════════════ */

describe('getVotingIdentity — passport record', () => {
  test('returns effectiveTier from passport and captures passportHash', async () => {
    pool.query.mockResolvedValue({
      rows: [{ type: 'passport', passport_hash: 'abc123', level: 2 }],
    });

    const result = await verificationService.getVotingIdentity(1);

    expect(result).toEqual({ effectiveTier: 2, passportHash: 'abc123' });
  });

  test('returns tier 3 when passport level is 3', async () => {
    pool.query.mockResolvedValue({
      rows: [{ type: 'passport', passport_hash: 'xyz', level: 3 }],
    });

    const result = await verificationService.getVotingIdentity(1);
    expect(result.effectiveTier).toBe(3);
  });
});

/* ════════════════════════════════════════════════════════════════
   getVotingIdentity — address-only verification
════════════════════════════════════════════════════════════════ */

describe('getVotingIdentity — address-only record', () => {
  test('returns correct tier but passportHash is null for address type', async () => {
    pool.query.mockResolvedValue({
      rows: [{ type: 'address', passport_hash: null, level: 1 }],
    });

    const result = await verificationService.getVotingIdentity(1);

    expect(result).toEqual({ effectiveTier: 1, passportHash: null });
  });
});

/* ════════════════════════════════════════════════════════════════
   getVotingIdentity — multiple active records
════════════════════════════════════════════════════════════════ */

describe('getVotingIdentity — multiple records', () => {
  test('picks the highest tier across multiple records', async () => {
    pool.query.mockResolvedValue({
      rows: [
        { type: 'address',  passport_hash: null,    level: 1 },
        { type: 'passport', passport_hash: 'p-hash', level: 2 },
      ],
    });

    const result = await verificationService.getVotingIdentity(1);

    expect(result.effectiveTier).toBe(2);
    expect(result.passportHash).toBe('p-hash');
  });

  test('returns passport hash when passport + address both active', async () => {
    pool.query.mockResolvedValue({
      rows: [
        { type: 'passport', passport_hash: 'the-hash', level: 2 },
        { type: 'address',  passport_hash: null,       level: 2 },
      ],
    });

    const result = await verificationService.getVotingIdentity(1);
    expect(result.passportHash).toBe('the-hash');
  });

  test('tier 3 wins over tier 1 even if address comes first', async () => {
    pool.query.mockResolvedValue({
      rows: [
        { type: 'address',  passport_hash: null,  level: 1 },
        { type: 'passport', passport_hash: 'ph',  level: 3 },
      ],
    });

    const result = await verificationService.getVotingIdentity(99);
    expect(result.effectiveTier).toBe(3);
  });
});

/* ════════════════════════════════════════════════════════════════
   getVotingIdentity — DB query scope (SQL WHERE clause validation)
════════════════════════════════════════════════════════════════ */

describe('getVotingIdentity — query guards', () => {
  test('SQL query filters out revoked records via WHERE clause', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    await verificationService.getVotingIdentity(1);

    const [sql] = pool.query.mock.calls[0];
    expect(sql).toMatch(/revoked\s*=\s*false/i);
  });

  test('SQL query filters out expired records via WHERE clause', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    await verificationService.getVotingIdentity(1);

    const [sql] = pool.query.mock.calls[0];
    expect(sql).toMatch(/expires_at\s*>/i);
  });
});

/* ════════════════════════════════════════════════════════════════
   getVotingIdentity — weird inputs
════════════════════════════════════════════════════════════════ */

describe('getVotingIdentity — edge inputs', () => {
  test('works with userId = 0 (passes it to DB without throwing)', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    await expect(verificationService.getVotingIdentity(0)).resolves.toEqual({
      effectiveTier: 0,
      passportHash: null,
    });
  });

  test('propagates DB errors to the caller', async () => {
    pool.query.mockRejectedValue(new Error('DB connection lost'));

    await expect(verificationService.getVotingIdentity(1)).rejects.toThrow(
      'DB connection lost'
    );
  });
});
