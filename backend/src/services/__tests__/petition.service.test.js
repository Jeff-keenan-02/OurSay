/**
 * Unit tests for petition.service.js
 *
 * All DB interaction is mocked — no real database required.
 * Tests cover: happy path, duplicate identity, tier mismatch,
 * missing passport, petition not found, and transaction rollback.
 */

jest.mock('../../db/pool');
jest.mock('../verification.service');
jest.mock('../actionToken.service');

const pool               = require('../../db/pool');
const verificationService = require('../verification.service');
const { generateActionToken } = require('../actionToken.service');
const petitionService    = require('../petition.service');

/* ─── helpers ────────────────────────────────────────────────── */

/**
 * Build a fake pg client whose query() responses are driven by
 * a queue of return values (one per call, in order).
 */
function makeFakeClient(responses = []) {
  const queue = [...responses];
  const client = {
    query: jest.fn(async (sql) => {
      // BEGIN / COMMIT / ROLLBACK always succeed silently
      if (/^(BEGIN|COMMIT|ROLLBACK)$/i.test(sql.trim())) return {};
      const next = queue.shift();
      if (next instanceof Error) throw next;
      return next ?? { rows: [] };
    }),
    release: jest.fn(),
  };
  return client;
}

/* ─── setup ──────────────────────────────────────────────────── */

beforeEach(() => {
  jest.clearAllMocks();
  generateActionToken.mockReturnValue('fake-token-hash');
});

/* ════════════════════════════════════════════════════════════════
   signPetition — happy path
════════════════════════════════════════════════════════════════ */

describe('signPetition — happy path', () => {
  test('returns { success: true } when all checks pass', async () => {
    verificationService.getVotingIdentity.mockResolvedValue({
      effectiveTier: 2,
      passportHash: 'abc123',
    });

    const client = makeFakeClient([
      { rows: [{ required_verification_tier: 2 }] }, // SELECT petition
      { rows: [] },                                    // INSERT petition_identity_usage
      { rows: [] },                                    // INSERT action_tokens
      { rows: [] },                                    // INSERT petition_signatures
      { rows: [] },                                    // UPDATE action_tokens used=true
      { rows: [] },                                    // INSERT petition_participation
    ]);
    pool.connect.mockResolvedValue(client);

    const result = await petitionService.signPetition({ userId: 1, petitionId: 10 });

    expect(result).toEqual({ success: true });
    expect(client.query).toHaveBeenCalledWith('COMMIT');
    expect(client.release).toHaveBeenCalled();
  });

  test('records participation row so UI can show "signed"', async () => {
    verificationService.getVotingIdentity.mockResolvedValue({
      effectiveTier: 3,
      passportHash: 'xyz789',
    });

    const client = makeFakeClient([
      { rows: [{ required_verification_tier: 2 }] },
      { rows: [] },
      { rows: [] },
      { rows: [] },
      { rows: [] },
      { rows: [] },
    ]);
    pool.connect.mockResolvedValue(client);

    await petitionService.signPetition({ userId: 99, petitionId: 5 });

    // The 6th data query (after BEGIN) should be the participation INSERT
    const dataCalls = client.query.mock.calls.filter(
      ([sql]) => !/^(BEGIN|COMMIT|ROLLBACK)$/i.test(sql.trim())
    );
    const participationCall = dataCalls[dataCalls.length - 1][0];
    expect(participationCall).toMatch(/petition_participation/i);
  });
});

/* ════════════════════════════════════════════════════════════════
   signPetition — duplicate passport (409)
════════════════════════════════════════════════════════════════ */

describe('signPetition — duplicate identity', () => {
  test('throws 409 when same passport signs twice', async () => {
    verificationService.getVotingIdentity.mockResolvedValue({
      effectiveTier: 2,
      passportHash: 'dup-hash',
    });

    const uniqueViolation = Object.assign(new Error('duplicate key'), { code: '23505' });

    const client = makeFakeClient([
      { rows: [{ required_verification_tier: 2 }] },
      uniqueViolation, // INSERT petition_identity_usage fails
    ]);
    pool.connect.mockResolvedValue(client);

    await expect(
      petitionService.signPetition({ userId: 1, petitionId: 10 })
    ).rejects.toMatchObject({
      message: 'This identity has already signed this petition',
      status: 409,
    });

    expect(client.query).toHaveBeenCalledWith('ROLLBACK');
    expect(client.release).toHaveBeenCalled();
  });

  test('rolls back the transaction on duplicate', async () => {
    verificationService.getVotingIdentity.mockResolvedValue({
      effectiveTier: 2,
      passportHash: 'dup-hash',
    });

    const uniqueViolation = Object.assign(new Error('duplicate key'), { code: '23505' });
    const client = makeFakeClient([
      { rows: [{ required_verification_tier: 2 }] },
      uniqueViolation,
    ]);
    pool.connect.mockResolvedValue(client);

    try { await petitionService.signPetition({ userId: 1, petitionId: 10 }); } catch {}

    const rollbackCalls = client.query.mock.calls.filter(([sql]) => /ROLLBACK/i.test(sql));
    expect(rollbackCalls).toHaveLength(1);
  });
});

/* ════════════════════════════════════════════════════════════════
   signPetition — insufficient tier
════════════════════════════════════════════════════════════════ */

describe('signPetition — tier restriction', () => {
  test('throws when user tier is below required', async () => {
    verificationService.getVotingIdentity.mockResolvedValue({
      effectiveTier: 1,
      passportHash: null,
    });

    const client = makeFakeClient([
      { rows: [{ required_verification_tier: 2 }] },
    ]);
    pool.connect.mockResolvedValue(client);

    await expect(
      petitionService.signPetition({ userId: 1, petitionId: 10 })
    ).rejects.toThrow('Insufficient verification level');
  });

  test('throws when unverified user (tier 0) tries to sign tier-2 petition', async () => {
    verificationService.getVotingIdentity.mockResolvedValue({
      effectiveTier: 0,
      passportHash: null,
    });

    const client = makeFakeClient([
      { rows: [{ required_verification_tier: 2 }] },
    ]);
    pool.connect.mockResolvedValue(client);

    await expect(
      petitionService.signPetition({ userId: 42, petitionId: 7 })
    ).rejects.toThrow('Insufficient verification level');
  });

  test('throws when tier is exactly met but passport hash is missing', async () => {
    verificationService.getVotingIdentity.mockResolvedValue({
      effectiveTier: 2,
      passportHash: null, // e.g. only address verification, no passport
    });

    const client = makeFakeClient([
      { rows: [{ required_verification_tier: 2 }] },
    ]);
    pool.connect.mockResolvedValue(client);

    await expect(
      petitionService.signPetition({ userId: 1, petitionId: 10 })
    ).rejects.toThrow('Active passport verification required');
  });

  test('does not insert identity_usage row when tier check fails', async () => {
    verificationService.getVotingIdentity.mockResolvedValue({
      effectiveTier: 1,
      passportHash: null,
    });

    const client = makeFakeClient([
      { rows: [{ required_verification_tier: 3 }] },
    ]);
    pool.connect.mockResolvedValue(client);

    try { await petitionService.signPetition({ userId: 1, petitionId: 10 }); } catch {}

    const dataCalls = client.query.mock.calls.filter(
      ([sql]) => !/^(BEGIN|COMMIT|ROLLBACK)$/i.test(sql.trim())
    );
    const hasIdentityInsert = dataCalls.some(([sql]) => /petition_identity_usage/i.test(sql));
    expect(hasIdentityInsert).toBe(false);
  });
});

/* ════════════════════════════════════════════════════════════════
   signPetition — petition not found
════════════════════════════════════════════════════════════════ */

describe('signPetition — petition not found', () => {
  test('throws when petition ID does not exist in DB', async () => {
    verificationService.getVotingIdentity.mockResolvedValue({
      effectiveTier: 3,
      passportHash: 'valid-hash',
    });

    const client = makeFakeClient([
      { rows: [] }, // empty result — no petition row
    ]);
    pool.connect.mockResolvedValue(client);

    await expect(
      petitionService.signPetition({ userId: 1, petitionId: 99999 })
    ).rejects.toThrow('Petition not found');
  });

  test('rolls back when petition not found', async () => {
    verificationService.getVotingIdentity.mockResolvedValue({
      effectiveTier: 3,
      passportHash: 'valid-hash',
    });

    const client = makeFakeClient([{ rows: [] }]);
    pool.connect.mockResolvedValue(client);

    try { await petitionService.signPetition({ userId: 1, petitionId: 99999 }); } catch {}

    const rollbackCalls = client.query.mock.calls.filter(([sql]) => /ROLLBACK/i.test(sql));
    expect(rollbackCalls).toHaveLength(1);
  });
});

/* ════════════════════════════════════════════════════════════════
   signPetition — unexpected DB error
════════════════════════════════════════════════════════════════ */

describe('signPetition — unexpected DB errors', () => {
  test('re-throws unexpected errors from petition SELECT', async () => {
    verificationService.getVotingIdentity.mockResolvedValue({
      effectiveTier: 2,
      passportHash: 'ok',
    });

    const dbError = new Error('connection refused');
    const client = makeFakeClient([dbError]);
    pool.connect.mockResolvedValue(client);

    await expect(
      petitionService.signPetition({ userId: 1, petitionId: 10 })
    ).rejects.toThrow('connection refused');
  });

  test('releases client even when getVotingIdentity throws', async () => {
    verificationService.getVotingIdentity.mockRejectedValue(
      new Error('verification service down')
    );

    const client = makeFakeClient([]);
    pool.connect.mockResolvedValue(client);

    await expect(
      petitionService.signPetition({ userId: 1, petitionId: 10 })
    ).rejects.toThrow('verification service down');

    expect(client.release).toHaveBeenCalled();
  });

  test('non-23505 DB error is not wrapped as 409', async () => {
    verificationService.getVotingIdentity.mockResolvedValue({
      effectiveTier: 2,
      passportHash: 'ok',
    });

    const foreignKeyViolation = Object.assign(new Error('foreign key'), { code: '23503' });
    const client = makeFakeClient([
      { rows: [{ required_verification_tier: 2 }] },
      foreignKeyViolation,
    ]);
    pool.connect.mockResolvedValue(client);

    const err = await petitionService.signPetition({ userId: 1, petitionId: 10 }).catch(e => e);

    expect(err.message).toBe('foreign key');
    expect(err.status).toBeUndefined();
  });
});

/* ════════════════════════════════════════════════════════════════
   signPetition — edge / weird inputs
════════════════════════════════════════════════════════════════ */

describe('signPetition — edge case inputs', () => {
  test('handles tier-3 petition signed by tier-3 user correctly', async () => {
    verificationService.getVotingIdentity.mockResolvedValue({
      effectiveTier: 3,
      passportHash: 'tier3-hash',
    });

    const client = makeFakeClient([
      { rows: [{ required_verification_tier: 3 }] },
      { rows: [] },
      { rows: [] },
      { rows: [] },
      { rows: [] },
      { rows: [] },
    ]);
    pool.connect.mockResolvedValue(client);

    const result = await petitionService.signPetition({ userId: 5, petitionId: 20 });
    expect(result).toEqual({ success: true });
  });

  test('uses the generated action token as the signature token_hash', async () => {
    generateActionToken.mockReturnValue('my-specific-token');

    verificationService.getVotingIdentity.mockResolvedValue({
      effectiveTier: 2,
      passportHash: 'some-hash',
    });

    const client = makeFakeClient([
      { rows: [{ required_verification_tier: 2 }] },
      { rows: [] },
      { rows: [] },
      { rows: [] },
      { rows: [] },
      { rows: [] },
    ]);
    pool.connect.mockResolvedValue(client);

    await petitionService.signPetition({ userId: 1, petitionId: 10 });

    const signatureInsert = client.query.mock.calls.find(
      ([sql]) => /petition_signatures/i.test(sql)
    );
    expect(signatureInsert[1]).toContain('my-specific-token');
  });

  test('participation INSERT uses ON CONFLICT DO NOTHING (idempotent)', async () => {
    verificationService.getVotingIdentity.mockResolvedValue({
      effectiveTier: 2,
      passportHash: 'h',
    });

    const client = makeFakeClient([
      { rows: [{ required_verification_tier: 2 }] },
      { rows: [] }, { rows: [] }, { rows: [] }, { rows: [] }, { rows: [] },
    ]);
    pool.connect.mockResolvedValue(client);

    await petitionService.signPetition({ userId: 1, petitionId: 10 });

    const participationCall = client.query.mock.calls.find(
      ([sql]) => /petition_participation/i.test(sql)
    );
    expect(participationCall[0]).toMatch(/ON CONFLICT DO NOTHING/i);
  });
});
