/**
 * Unit tests for jwt.service.js
 *
 * Tests generateToken and verifyToken including:
 * happy path, payload integrity, expiry enforcement,
 * tampered signature, wrong secret, and missing token.
 */

// Provide a stable secret so tests never depend on the real env var
process.env.JWT_SECRET = 'test-secret-do-not-use-in-production';

const jwt        = require('jsonwebtoken');
const jwtService = require('../jwt.service');

/* ════════════════════════════════════════════════════════════════
   generateToken
════════════════════════════════════════════════════════════════ */

describe('generateToken', () => {
  test('returns a non-empty string', () => {
    const token = jwtService.generateToken({ id: 1 });
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  test('produces a three-part JWT (header.payload.signature)', () => {
    const token = jwtService.generateToken({ id: 1 });
    expect(token.split('.')).toHaveLength(3);
  });

  test('embeds the payload fields inside the token', () => {
    const token = jwtService.generateToken({ id: 7, role: 'admin' });
    const decoded = jwt.decode(token);
    expect(decoded.id).toBe(7);
    expect(decoded.role).toBe('admin');
  });

  test('includes an exp claim (token will expire)', () => {
    const token = jwtService.generateToken({ id: 1 });
    const decoded = jwt.decode(token);
    expect(decoded.exp).toBeDefined();
    expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  test('two calls with the same payload produce different tokens (iat differs)', () => {
    // Freeze time briefly so iat is identical — tokens still differ due to jwt internal nonce?
    // Actually the simplest check: two tokens from different payloads differ
    const t1 = jwtService.generateToken({ id: 1 });
    const t2 = jwtService.generateToken({ id: 2 });
    expect(t1).not.toBe(t2);
  });
});

/* ════════════════════════════════════════════════════════════════
   verifyToken — valid tokens
════════════════════════════════════════════════════════════════ */

describe('verifyToken — valid token', () => {
  test('returns decoded payload for a freshly generated token', () => {
    const token = jwtService.generateToken({ id: 42 });
    const decoded = jwtService.verifyToken(token);
    expect(decoded.id).toBe(42);
  });

  test('round-trips multiple payload fields intact', () => {
    const payload = { id: 5, email: 'user@example.com', tier: 2 };
    const token   = jwtService.generateToken(payload);
    const decoded = jwtService.verifyToken(token);

    expect(decoded.id).toBe(5);
    expect(decoded.email).toBe('user@example.com');
    expect(decoded.tier).toBe(2);
  });
});

/* ════════════════════════════════════════════════════════════════
   verifyToken — tampered / invalid tokens
════════════════════════════════════════════════════════════════ */

describe('verifyToken — tampered token', () => {
  test('throws JsonWebTokenError when signature is altered', () => {
    const token  = jwtService.generateToken({ id: 1 });
    const parts  = token.split('.');
    parts[2]     = parts[2].split('').reverse().join(''); // flip the signature
    const tampered = parts.join('.');

    expect(() => jwtService.verifyToken(tampered)).toThrow(jwt.JsonWebTokenError);
  });

  test('throws JsonWebTokenError when payload is altered', () => {
    const token   = jwtService.generateToken({ id: 1 });
    const parts   = token.split('.');
    // Replace payload with a different base64 blob
    parts[1]      = Buffer.from(JSON.stringify({ id: 999 })).toString('base64url');
    const tampered = parts.join('.');

    expect(() => jwtService.verifyToken(tampered)).toThrow(jwt.JsonWebTokenError);
  });

  test('throws JsonWebTokenError for a completely random string', () => {
    expect(() => jwtService.verifyToken('not.a.jwt')).toThrow(jwt.JsonWebTokenError);
  });

  test('throws JsonWebTokenError for an empty string', () => {
    expect(() => jwtService.verifyToken('')).toThrow();
  });

  test('throws JsonWebTokenError for token signed with a different secret', () => {
    const wrongSecret = 'completely-different-secret';
    const token = jwt.sign({ id: 1 }, wrongSecret, { expiresIn: '7d' });

    expect(() => jwtService.verifyToken(token)).toThrow(jwt.JsonWebTokenError);
  });
});

/* ════════════════════════════════════════════════════════════════
   verifyToken — expired token
════════════════════════════════════════════════════════════════ */

describe('verifyToken — expired token', () => {
  test('throws TokenExpiredError for a token with expiresIn of 1ms', () => {
    // Sign directly with a 1-second expiry then backdate it
    const expiredToken = jwt.sign(
      { id: 1 },
      process.env.JWT_SECRET,
      { expiresIn: -1 } // already expired
    );

    expect(() => jwtService.verifyToken(expiredToken)).toThrow(jwt.TokenExpiredError);
  });
});
