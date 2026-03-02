const pool = require('../db/pool');
const verificationService = require('./verification.service');
const { generateActionToken } = require('./actionToken.service');

exports.votePoll = async ({ userId, pollId, choice }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if (!['yes', 'no'].includes(choice)) {
      throw new Error('Invalid choice');
    }

    // 1️⃣ Validate tier + get passport proof
    const { effectiveTier, passportHash } = await verificationService.getVotingIdentity(userId);

    const pollResult = await client.query(
      `
      SELECT 
        pg.required_verification_tier
      FROM polls p
      JOIN poll_groups pg
        ON pg.id = p.poll_group_id
      WHERE p.id = $1
      `,
      [pollId]
    );

    if (!pollResult.rows.length) {
      throw new Error('Poll not found');
    }

    const { required_verification_tier } = pollResult.rows[0];

    // Tier check
    if (effectiveTier < required_verification_tier) {
      throw new Error('Insufficient verification level');
    }

    // Passport required for tier 2+
    if (required_verification_tier >= 2 && !passportHash) {
      throw new Error('Active passport verification required');
    }

    // 2️⃣ Enforce one passport per poll
    await client.query(
      `INSERT INTO poll_identity_usage (poll_id, passport_hash)
       VALUES ($1, $2)`,
      [pollId, passportHash]
    );

    // 3️⃣ Generate anonymous vote token
    const token = generateActionToken();

    await client.query(
      `INSERT INTO action_tokens
       (token_hash, action_type, poll_id, expires_at)
       VALUES ($1, 'poll_vote', $2, NOW() + INTERVAL '10 minutes')`,
      [token, pollId]
    );

    // 4️⃣ Store vote anonymously
    await client.query(
      `INSERT INTO poll_votes (poll_id, token_hash, choice)
       VALUES ($1, $2, $3)`,
      [pollId, token, choice]
    );

    await client.query(
      `UPDATE action_tokens
       SET used = TRUE
       WHERE token_hash = $1`,
      [token]
    );

    // 5️⃣ UI-only participation tracking
    await client.query(
      `INSERT INTO poll_participation (user_id, poll_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [userId, pollId]
    );

    await client.query('COMMIT');

    return { success: true };

  } catch (err) {
    await client.query('ROLLBACK');

    if (err.code === '23505') {
      throw new Error('This identity has already voted in this poll');
    }

    throw err;

  } finally {
    client.release();
  }
};