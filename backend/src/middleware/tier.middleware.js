const pool = require("../db/pool");

module.exports = function requireTier(minTier) {
  return async function (req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const userId = req.user.id;

      const result = await pool.query(`
        SELECT COALESCE(MAX(level), 0) AS tier
        FROM verifications
        WHERE user_id = $1
        AND revoked = false
        AND expires_at > NOW()
      `, [userId]);

      const tier = Number(result.rows[0].tier);

      if (tier < minTier) {
        return res.status(403).json({
          error: "Insufficient verification tier",
          requiredTier: minTier,
          currentTier: tier
        });
      }

      next();

    } catch (err) {
      console.error("Tier middleware error:", err);
      return res.status(500).json({ error: "Tier validation failed" });
    }
  };
};