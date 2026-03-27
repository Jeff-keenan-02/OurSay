/**
 * Unit tests for auth.controller.js
 *
 * Covers: signup (happy path, missing fields, short password, duplicate username),
 * login (happy path, wrong password, unknown user, missing fields),
 * changePassword (happy path, wrong current password, same password, too short).
 */

process.env.JWT_SECRET = 'test-secret-do-not-use-in-production';

jest.mock('../../db/pool');
jest.mock('bcrypt');

const pool       = require('../../db/pool');
const bcrypt     = require('bcrypt');
const controller = require('../auth.controller');

/* ─── helpers ────────────────────────────────────────────────── */

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => jest.clearAllMocks());

/* ════════════════════════════════════════════════════════════════
   signup
════════════════════════════════════════════════════════════════ */

describe('signup', () => {
  test('returns 201 and a token on valid input', async () => {
    bcrypt.hash.mockResolvedValue('hashed-password');
    pool.query.mockResolvedValue({
      rows: [{ id: 1, username: 'jeff', verification_tier: 0 }],
    });

    const req = { body: { username: 'jeff', password: 'password123' } };
    const res = makeRes();

    await controller.signup(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const body = res.json.mock.calls[0][0];
    expect(body.token).toBeDefined();
    expect(body.user.username).toBe('jeff');
  });

  test('returns 400 when username is missing', async () => {
    const req = { body: { password: 'password123' } };
    const res = makeRes();

    await controller.signup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 400 when password is missing', async () => {
    const req = { body: { username: 'jeff' } };
    const res = makeRes();

    await controller.signup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 400 when password is shorter than 8 characters', async () => {
    const req = { body: { username: 'jeff', password: 'short' } };
    const res = makeRes();

    await controller.signup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringMatching(/8 characters/i) }));
  });

  test('returns 409 when username is already taken', async () => {
    bcrypt.hash.mockResolvedValue('hashed');
    pool.query.mockRejectedValue(Object.assign(new Error('duplicate'), { code: '23505' }));

    const req = { body: { username: 'taken', password: 'password123' } };
    const res = makeRes();

    await controller.signup(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringMatching(/taken/i) }));
  });

  test('returns 500 on unexpected DB error', async () => {
    bcrypt.hash.mockResolvedValue('hashed');
    pool.query.mockRejectedValue(new Error('connection lost'));

    const req = { body: { username: 'jeff', password: 'password123' } };
    const res = makeRes();

    await controller.signup(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('password is hashed before storing (never stored in plain text)', async () => {
    bcrypt.hash.mockResolvedValue('bcrypt-hash');
    pool.query.mockResolvedValue({
      rows: [{ id: 1, username: 'jeff', verification_tier: 0 }],
    });

    const req = { body: { username: 'jeff', password: 'myplainpassword' } };
    await controller.signup(req, makeRes());

    const insertParams = pool.query.mock.calls[0][1];
    expect(insertParams).toContain('bcrypt-hash');
    expect(insertParams).not.toContain('myplainpassword');
  });
});

/* ════════════════════════════════════════════════════════════════
   login
════════════════════════════════════════════════════════════════ */

describe('login', () => {
  test('returns 200 with token and user on valid credentials', async () => {
    pool.query.mockResolvedValue({
      rowCount: 1,
      rows: [{ id: 5, username: 'jeff', password_hash: 'hashed', verification_tier: 1 }],
    });
    bcrypt.compare.mockResolvedValue(true);

    const req = { body: { username: 'jeff', password: 'password123' } };
    const res = makeRes();

    await controller.login(req, res);

    expect(res.status).not.toHaveBeenCalledWith(401);
    const body = res.json.mock.calls[0][0];
    expect(body.token).toBeDefined();
    expect(body.user.id).toBe(5);
  });

  test('returns 400 when both fields are missing', async () => {
    const req = { body: {} };
    const res = makeRes();

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 401 when username does not exist', async () => {
    pool.query.mockResolvedValue({ rowCount: 0, rows: [] });

    const req = { body: { username: 'nobody', password: 'password123' } };
    const res = makeRes();

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('returns 401 when password is wrong', async () => {
    pool.query.mockResolvedValue({
      rowCount: 1,
      rows: [{ id: 1, username: 'jeff', password_hash: 'hashed', verification_tier: 0 }],
    });
    bcrypt.compare.mockResolvedValue(false);

    const req = { body: { username: 'jeff', password: 'wrongpassword' } };
    const res = makeRes();

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('error message for wrong username and wrong password is identical (no user enumeration)', async () => {
    // Wrong username
    pool.query.mockResolvedValue({ rowCount: 0, rows: [] });
    const res1 = makeRes();
    await controller.login({ body: { username: 'nobody', password: 'pass' } }, res1);
    const msg1 = res1.json.mock.calls[0][0].error;

    // Wrong password
    pool.query.mockResolvedValue({
      rowCount: 1,
      rows: [{ id: 1, username: 'jeff', password_hash: 'h', verification_tier: 0 }],
    });
    bcrypt.compare.mockResolvedValue(false);
    const res2 = makeRes();
    await controller.login({ body: { username: 'jeff', password: 'wrong' } }, res2);
    const msg2 = res2.json.mock.calls[0][0].error;

    expect(msg1).toBe(msg2);
  });

  test('returns 500 on DB error', async () => {
    pool.query.mockRejectedValue(new Error('db down'));
    const res = makeRes();

    await controller.login({ body: { username: 'jeff', password: 'pass' } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

/* ════════════════════════════════════════════════════════════════
   changePassword
════════════════════════════════════════════════════════════════ */

describe('changePassword', () => {
  test('returns 200 on valid password change', async () => {
    pool.query
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ password_hash: 'old-hash' }] })
      .mockResolvedValueOnce({});
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('new-hash');

    const req = { user: { id: 1 }, body: { currentPassword: 'OldPass1!', newPassword: 'NewPass1!' } };
    const res = makeRes();

    await controller.changePassword(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });

  test('returns 400 when either password field is missing', async () => {
    const req = { user: { id: 1 }, body: { currentPassword: 'OldPass1!' } };
    const res = makeRes();

    await controller.changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 400 when new password is less than 8 characters', async () => {
    const req = { user: { id: 1 }, body: { currentPassword: 'OldPass1!', newPassword: 'short' } };
    const res = makeRes();

    await controller.changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 400 when new password is the same as current', async () => {
    const req = { user: { id: 1 }, body: { currentPassword: 'SamePass1!', newPassword: 'SamePass1!' } };
    const res = makeRes();

    await controller.changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringMatching(/different/i) }));
  });

  test('returns 401 when current password is incorrect', async () => {
    pool.query.mockResolvedValue({ rowCount: 1, rows: [{ password_hash: 'hash' }] });
    bcrypt.compare.mockResolvedValue(false);

    const req = { user: { id: 1 }, body: { currentPassword: 'WrongOld!', newPassword: 'NewPass1!' } };
    const res = makeRes();

    await controller.changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('returns 404 when user no longer exists', async () => {
    pool.query.mockResolvedValue({ rowCount: 0, rows: [] });

    const req = { user: { id: 999 }, body: { currentPassword: 'OldPass1!', newPassword: 'NewPass1!' } };
    const res = makeRes();

    await controller.changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('returns 500 on unexpected DB error', async () => {
    pool.query.mockRejectedValue(new Error('db down'));

    const req = { user: { id: 1 }, body: { currentPassword: 'OldPass1!', newPassword: 'NewPass1!' } };
    const res = makeRes();

    await controller.changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('new password is hashed before storing', async () => {
    pool.query
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ password_hash: 'old-hash' }] })
      .mockResolvedValueOnce({});
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('new-bcrypt-hash');

    const req = { user: { id: 1 }, body: { currentPassword: 'OldPass1!', newPassword: 'NewPass1!' } };
    await controller.changePassword(req, makeRes());

    const updateParams = pool.query.mock.calls[1][1];
    expect(updateParams).toContain('new-bcrypt-hash');
    expect(updateParams).not.toContain('NewPass1!');
  });
});
