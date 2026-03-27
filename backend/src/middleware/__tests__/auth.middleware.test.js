/**
 * Unit tests for auth.middleware.js (requireAuth)
 *
 * Covers: valid token, missing header, malformed header,
 * expired token, tampered token, and req.user population.
 */

process.env.JWT_SECRET = 'test-secret-do-not-use-in-production';

const jwt         = require('jsonwebtoken');
const requireAuth = require('../auth.middleware');

/* ─── helpers ────────────────────────────────────────────────── */

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

function validToken(payload = { userId: 42 }) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

/* ════════════════════════════════════════════════════════════════
   Valid token
════════════════════════════════════════════════════════════════ */

describe('requireAuth — valid token', () => {
  test('calls next() when token is valid', () => {
    const req  = { headers: { authorization: `Bearer ${validToken()}` } };
    const res  = makeRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('sets req.user.id from the decoded userId claim', () => {
    const req  = { headers: { authorization: `Bearer ${validToken({ userId: 99 })}` } };
    const res  = makeRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(req.user).toEqual({ id: 99 });
  });
});

/* ════════════════════════════════════════════════════════════════
   Missing / malformed Authorization header
════════════════════════════════════════════════════════════════ */

describe('requireAuth — missing or malformed header', () => {
  test('returns 401 when Authorization header is absent', () => {
    const req  = { headers: {} };
    const res  = makeRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when header does not start with "Bearer "', () => {
    const req  = { headers: { authorization: validToken() } }; // missing "Bearer " prefix
    const res  = makeRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 for "Basic <token>" scheme', () => {
    const req  = { headers: { authorization: `Basic ${validToken()}` } };
    const res  = makeRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('returns 401 when token part is an empty string', () => {
    const req  = { headers: { authorization: 'Bearer ' } };
    const res  = makeRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});

/* ════════════════════════════════════════════════════════════════
   Invalid / tampered / expired token
════════════════════════════════════════════════════════════════ */

describe('requireAuth — bad token', () => {
  test('returns 401 for a completely random string', () => {
    const req  = { headers: { authorization: 'Bearer not.a.real.token' } };
    const res  = makeRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 for a token signed with a different secret', () => {
    const token = jwt.sign({ userId: 1 }, 'wrong-secret', { expiresIn: '1h' });
    const req   = { headers: { authorization: `Bearer ${token}` } };
    const res   = makeRes();
    const next  = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('returns 401 for an expired token', () => {
    const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET, { expiresIn: -1 });
    const req   = { headers: { authorization: `Bearer ${token}` } };
    const res   = makeRes();
    const next  = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('returns 401 for a tampered signature', () => {
    const parts  = validToken().split('.');
    parts[2]     = parts[2].split('').reverse().join('');
    const req    = { headers: { authorization: `Bearer ${parts.join('.')}` } };
    const res    = makeRes();
    const next   = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('error response includes a message', () => {
    const req = { headers: { authorization: 'Bearer garbage' } };
    const res = makeRes();

    requireAuth(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
  });
});
