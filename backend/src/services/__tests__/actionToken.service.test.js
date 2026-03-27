/**
 * Unit tests for actionToken.service.js
 *
 * Tests generateActionToken including: format, length,
 * uniqueness, and entropy (no repeated tokens across many calls).
 */

const { generateActionToken } = require('../actionToken.service');

/* ════════════════════════════════════════════════════════════════
   generateActionToken
════════════════════════════════════════════════════════════════ */

describe('generateActionToken', () => {
  test('returns a string', () => {
    expect(typeof generateActionToken()).toBe('string');
  });

  test('returns a 64-character hex string (32 bytes)', () => {
    const token = generateActionToken();
    expect(token).toHaveLength(64);
  });

  test('contains only lowercase hex characters', () => {
    const token = generateActionToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  test('two consecutive calls produce different tokens', () => {
    expect(generateActionToken()).not.toBe(generateActionToken());
  });

  test('generates unique tokens across 1000 calls (no collisions)', () => {
    const tokens = new Set(Array.from({ length: 1000 }, generateActionToken));
    expect(tokens.size).toBe(1000);
  });
});
