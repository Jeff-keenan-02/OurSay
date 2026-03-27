/**
 * Unit tests for poll.service.js
 *
 * Mirrors the petition service test structure.
 * Covers: valid votes, duplicate identity, invalid choice,
 * tier mismatch, missing passport, poll not found, and rollback.
 */

jest.mock('../../db/pool');
jest.mock('../verification.service');
jest.mock('../actionToken.service');

const pool                = require('../../db/pool');
const verificationService = require('../verification.service');
const { generateActionToken } = require('../actionToken.service');
const pollService         = require('../poll.service');

/* ─── helpers ────────────────────────────────────────────────── */

function makeFakeClient(responses = []) {
  const queue = [...responses];
  const client = {
    query: jest.fn(async (sql) => {
      if (/^(BEGIN|COMMIT|ROLLBACK)$/i.test(sql.trim())) return {};
      const next = queue.shift();
      if (next instanceof Error) throw next;
      return next ?? { rows: [] };
    }),
    release: jest.fn(),
  };
  return client;
}

beforeEach(() => {
  jest.clearAllMocks();
  generateActionToken.mockReturnValue('vote-token');
});

/* ════════════════════════════════════════════════════════════════
   votePoll — happy path
════════════════════════════════════════════════════════════════ */

describe('votePoll — happy path', () => {
  test.each([['yes'], ['no']])(
    'returns { success: true } for choice "%s"',
    async (choice) => {
      verificationService.getVotingIdentity.mockResolvedValue({
        effectiveTier: 2,
        passportHash: 'p-hash',
      });

      const client = makeFakeClient([
        { rows: [{ required_verification_tier: 2 }] },
        { rows: [] }, // poll_identity_usage
        { rows: [] }, // action_tokens INSERT
        { rows: [] }, // poll_votes INSERT
        { rows: [] }, // action_tokens UPDATE used=true
        { rows: [] }, // poll_participation
      ]);
      pool.connect.mockResolvedValue(client);

      const result = await pollService.votePoll({ userId: 1, pollId: 5, choice });
      expect(result).toEqual({ success: true });
      expect(client.query).toHaveBeenCalledWith('COMMIT');
    }
  );

  test('stores the vote with correct choice', async () => {
    verificationService.getVotingIdentity.mockResolvedValue({
      effectiveTier: 2,
      passportHash: 'ph',
    });

    const client = makeFakeClient([
      { rows: [{ required_verification_tier: 2 }] },
      { rows: [] }, { rows: [] }, { rows: [] }, { rows: [] }, { rows: [] },
    ]);
    pool.connect.mockResolvedValue(client);

    await pollService.votePoll({ userId: 1, pollId: 5, choice: 'yes' });

    const voteInsert = client.query.mock.calls.find(
      ([sql]) => /poll_votes/i.test(sql)
    );
    expect(voteInsert[1]).toContain('yes');
  });
});

/* ════════════════════════════════════════════════════════════════
   votePoll — invalid choice
════════════════════════════════════════════════════════════════ */

describe('votePoll — invalid choice', () => {
  test.each([['maybe'], ['YES'], [''], [null], [undefined], [1], ['abstain']])(
    'throws "Invalid choice" for value %p',
    async (choice) => {
      verificationService.getVotingIdentity.mockResolvedValue({
        effectiveTier: 2,
        passportHash: 'ph',
      });
      const client = makeFakeClient([]);
      pool.connect.mockResolvedValue(client);

      await expect(
        pollService.votePoll({ userId: 1, pollId: 5, choice })
      ).rejects.toThrow('Invalid choice');
    }
  );

  test('rolls back when choice is invalid', async () => {
    verificationService.getVotingIdentity.mockResolvedValue({
      effectiveTier: 2,
      passportHash: 'ph',
    });
    const client = makeFakeClient([]);
    pool.connect.mockResolvedValue(client);

    try { await pollService.votePoll({ userId: 1, pollId: 5, choice: 'invalid' }); } catch {}

    const rollbackCalls = client.query.mock.calls.filter(([sql]) => /ROLLBACK/i.test(sql));
    expect(rollbackCalls).toHaveLength(1);
  });
});

/* ════════════════════════════════════════════════════════════════
   votePoll — duplicate identity (409)
════════════════════════════════════════════════════════════════ */

describe('votePoll — duplicate identity', () => {
  test('throws 409 when same passport votes twice', async () => {
    verificationService.getVotingIdentity.mockResolvedValue({
      effectiveTier: 2,
      passportHash: 'dup',
    });

    const uniqueViolation = Object.assign(new Error('duplicate key'), { code: '23505' });
    const client = makeFakeClient([
      { rows: [{ required_verification_tier: 2 }] },
      uniqueViolation,
    ]);
    pool.connect.mockResolvedValue(client);

    await expect(
      pollService.votePoll({ userId: 1, pollId: 5, choice: 'yes' })
    ).rejects.toMatchObject({
      message: 'This identity has already voted in this poll',
      status: 409,
    });
  });

  test('releases client after 409 error', async () => {
    verificationService.getVotingIdentity.mockResolvedValue({
      effectiveTier: 2,
      passportHash: 'dup',
    });

    const uniqueViolation = Object.assign(new Error('duplicate key'), { code: '23505' });
    const client = makeFakeClient([
      { rows: [{ required_verification_tier: 2 }] },
      uniqueViolation,
    ]);
    pool.connect.mockResolvedValue(client);

    try { await pollService.votePoll({ userId: 1, pollId: 5, choice: 'yes' }); } catch {}

    expect(client.release).toHaveBeenCalled();
  });
});

/* ════════════════════════════════════════════════════════════════
   votePoll — tier restriction
════════════════════════════════════════════════════════════════ */

describe('votePoll — tier restriction', () => {
  test('throws when user tier is too low', async () => {
    verificationService.getVotingIdentity.mockResolvedValue({
      effectiveTier: 1,
      passportHash: null,
    });

    const client = makeFakeClient([
      { rows: [{ required_verification_tier: 2 }] },
    ]);
    pool.connect.mockResolvedValue(client);

    await expect(
      pollService.votePoll({ userId: 1, pollId: 5, choice: 'yes' })
    ).rejects.toThrow('Insufficient verification level');
  });

  test('throws when tier meets requirement but passport hash is absent', async () => {
    verificationService.getVotingIdentity.mockResolvedValue({
      effectiveTier: 2,
      passportHash: null,
    });

    const client = makeFakeClient([
      { rows: [{ required_verification_tier: 2 }] },
    ]);
    pool.connect.mockResolvedValue(client);

    await expect(
      pollService.votePoll({ userId: 1, pollId: 5, choice: 'no' })
    ).rejects.toThrow('Active passport verification required');
  });
});

/* ════════════════════════════════════════════════════════════════
   votePoll — poll not found
════════════════════════════════════════════════════════════════ */

describe('votePoll — poll not found', () => {
  test('throws when poll does not exist', async () => {
    verificationService.getVotingIdentity.mockResolvedValue({
      effectiveTier: 3,
      passportHash: 'ok',
    });

    const client = makeFakeClient([{ rows: [] }]);
    pool.connect.mockResolvedValue(client);

    await expect(
      pollService.votePoll({ userId: 1, pollId: 99999, choice: 'yes' })
    ).rejects.toThrow('Poll not found');
  });
});

/* ════════════════════════════════════════════════════════════════
   votePoll — unexpected DB errors
════════════════════════════════════════════════════════════════ */

describe('votePoll — unexpected DB errors', () => {
  test('releases client when getVotingIdentity throws', async () => {
    verificationService.getVotingIdentity.mockRejectedValue(
      new Error('identity service crashed')
    );

    const client = makeFakeClient([]);
    pool.connect.mockResolvedValue(client);

    await expect(
      pollService.votePoll({ userId: 1, pollId: 5, choice: 'yes' })
    ).rejects.toThrow('identity service crashed');

    expect(client.release).toHaveBeenCalled();
  });

  test('non-23505 error is not wrapped as 409', async () => {
    verificationService.getVotingIdentity.mockResolvedValue({
      effectiveTier: 2,
      passportHash: 'ok',
    });

    const checkViolation = Object.assign(new Error('check constraint'), { code: '23514' });
    const client = makeFakeClient([
      { rows: [{ required_verification_tier: 2 }] },
      checkViolation,
    ]);
    pool.connect.mockResolvedValue(client);

    const err = await pollService.votePoll({ userId: 1, pollId: 5, choice: 'yes' }).catch(e => e);

    expect(err.message).toBe('check constraint');
    expect(err.status).toBeUndefined();
  });
});

/* ════════════════════════════════════════════════════════════════
   votePoll — anonymous token
════════════════════════════════════════════════════════════════ */

describe('votePoll — token anonymity', () => {
  test('vote row uses the generated token, not the userId', async () => {
    generateActionToken.mockReturnValue('anon-vote-token');
    verificationService.getVotingIdentity.mockResolvedValue({
      effectiveTier: 2,
      passportHash: 'ph',
    });

    const client = makeFakeClient([
      { rows: [{ required_verification_tier: 2 }] },
      { rows: [] }, { rows: [] }, { rows: [] }, { rows: [] }, { rows: [] },
    ]);
    pool.connect.mockResolvedValue(client);

    await pollService.votePoll({ userId: 7, pollId: 5, choice: 'no' });

    const voteInsert = client.query.mock.calls.find(([sql]) => /poll_votes/i.test(sql));
    const params = voteInsert[1];

    // Token hash present, userId (7) must NOT be in the vote row params
    expect(params).toContain('anon-vote-token');
    expect(params).not.toContain(7);
  });
});
