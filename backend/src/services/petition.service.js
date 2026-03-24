const pool = require('../db/pool');
const verificationService = require('./verification.service');
const { generateActionToken } = require('./actionToken.service');

exports.signPetition = async ({ userId, petitionId }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1️⃣ Validate tier + get active passport proof
    const { effectiveTier, passportHash } =
      await verificationService.getVotingIdentity(userId);

    const petitionResult = await client.query(
      `SELECT required_verification_tier
       FROM petitions
       WHERE id = $1`,
      [petitionId]
    );

    if (!petitionResult.rows.length) {
      throw new Error('Petition not found');
    }

    const { required_verification_tier } = petitionResult.rows[0];

    // Tier check
    if (effectiveTier < required_verification_tier) {
      throw new Error('Insufficient verification level');
    }

    // Passport required for tier 2+
    if (required_verification_tier >= 2 && !passportHash) {
      throw new Error('Active passport verification required');
    }

    // 2️⃣ Enforce one passport per petition (DB-level guarantee)
    await client.query(
      `INSERT INTO petition_identity_usage (petition_id, passport_hash)
       VALUES ($1, $2)`,
      [petitionId, passportHash]
    );

    // 3️⃣ Generate anonymous token
    const token = generateActionToken();

    await client.query(
      `INSERT INTO action_tokens
       (token_hash, action_type, petition_id, expires_at)
       VALUES ($1, 'petition_sign', $2, NOW() + INTERVAL '10 minutes')`,
      [token, petitionId]
    );

    // 4️⃣ Store signature (no identity linkage)
    await client.query(
      `INSERT INTO petition_signatures (petition_id, token_hash)
       VALUES ($1, $2)`,
      [petitionId, token]
    );

    await client.query(
      `UPDATE action_tokens
       SET used = TRUE
       WHERE token_hash = $1`,
      [token]
    );

    // 5️⃣ UI-only participation tracking
    await client.query(
      `INSERT INTO petition_participation (user_id, petition_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [userId, petitionId]
    );

    await client.query('COMMIT');

    return { success: true };

  } catch (err) {
    await client.query('ROLLBACK');

    if (err.code === '23505') {
      const conflictError = new Error('This identity has already signed this petition');
      conflictError.status = 409;
      throw conflictError;
    }
    throw err;

  } finally {
    client.release();
  }
};