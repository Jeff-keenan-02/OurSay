const pool = require('../db/pool');

exports.getVotingIdentity = async (userId) => {
  const result = await pool.query(
    `SELECT type, passport_hash, level
     FROM verifications
     WHERE user_id = $1
       AND revoked = false
       AND expires_at > NOW()`,
    [userId]
  );

  if (!result.rows.length) {
    return { effectiveTier: 0, passportHash: null };
  }

  let effectiveTier = 0;
  let passportHash = null;

  for (const row of result.rows) {
    // Track highest tier
    effectiveTier = Math.max(effectiveTier, row.level);

    // Capture passport hash (only one can exist active)
    if (row.type === 'passport') {
      passportHash = row.passport_hash;
    }
  }

  return {
    effectiveTier,
    passportHash
  };
};