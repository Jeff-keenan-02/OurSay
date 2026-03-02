const pool = require("../db/pool");

module.exports = function requireTier(minTier) {
  return async function (req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const userId = req.user.id;
      
      const result = await pool.query(
        "SELECT verification_tier FROM users WHERE id = $1",
        [userId]
      );

      if (result.rowCount === 0) {
        return res.status(401).json({ error: "User not found" });
      }

      const tier = result.rows[0].verification_tier;

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