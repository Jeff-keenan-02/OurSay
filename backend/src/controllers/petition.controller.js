const crypto = require("crypto");
const pool = require("../db/pool");


/* ------------------------------
   GET trending by Petiton
------------------------------ */
exports.getTrendingPetition = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.title,
        p.description,
        p.required_verification_tier,
        p.signature_goal,
        COUNT(ps.id)::int AS signatures,
        CASE
          WHEN p.signature_goal = 0 THEN 0
          ELSE COUNT(ps.id)::float / p.signature_goal
        END AS progress
      FROM petitions p
      LEFT JOIN petition_signatures ps
        ON ps.petition_id = p.id
      GROUP BY p.id, p.title, p.description, p.required_verification_tier, p.signature_goal
      ORDER BY signatures DESC
      LIMIT 3;
    `);

    res.json(result.rows);

  } catch (err) {
    console.error("getTrendingPetition:", err);
    res.status(500).json({ error: "Failed to load trending petition" });
  }
};

/* ------------------------------
   GET weekly by Petition
------------------------------ */

exports.getWeeklyPetition = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.title,
        p.description,
        p.signature_goal,
        COUNT(ps.id)::int AS signatures,
        CASE
          WHEN p.signature_goal = 0 THEN 0
          ELSE COUNT(ps.id)::float / p.signature_goal
        END AS progress
      FROM petitions p
      JOIN topics t ON t.id = p.topic_id
      LEFT JOIN petition_signatures ps
        ON ps.petition_id = p.id
      WHERE t.is_weekly = true
      GROUP BY p.id, p.title, p.description, p.required_verification_tier, p.signature_goal
      ORDER BY p.created_at DESC
      LIMIT 1;
    `);

    res.json(result.rows[0] ?? null);
  } catch (err) {
    console.error("getWeeklyPetition:", err);
    res.status(500).json({ error: "Failed to load weekly petition" });
  }
};
/* ------------------------------
   GET list of petitions
------------------------------ */
exports.getPetitionsByTopic = async (req, res) => {
  const topicId = Number(req.params.id);

  if (!topicId || isNaN(topicId)) {
    return res.status(400).json({ error: "Invalid topic ID" });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        p.id,
        p.title,
        p.description,
        p.signature_goal,
        COUNT(ps.id)::int AS signatures,
        CASE
          WHEN p.signature_goal = 0 THEN 0
          ELSE COUNT(ps.id)::float / p.signature_goal
        END AS progress
      FROM petitions p
      LEFT JOIN petition_signatures ps ON ps.petition_id = p.id
      WHERE p.topic_id = $1
      GROUP BY p.id, p.title, p.description, p.signature_goal
      ORDER BY p.created_at DESC;
      `,
      [topicId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("getPetitionsByTopic:", err);
    res.status(500).json({ error: "Failed to load petitions for topic" });
  }
};


/* ------------------------------
   GET single petition
------------------------------ */
exports.getPetition = async (req, res) => {
  const petitionId = Number(req.params.id);

  try {
    const { rows } = await pool.query(
      `
      SELECT
        p.id,
        p.title,
        p.description,
        p.required_verification_tier,
        p.signature_goal,

        COUNT(ps.id)::int AS signatures,

        CASE
          WHEN p.signature_goal = 0 THEN 0
          ELSE COUNT(ps.id)::float / p.signature_goal
        END AS progress

      FROM petitions p
      LEFT JOIN petition_signatures ps
        ON ps.petition_id = p.id

      WHERE p.id = $1

      GROUP BY
        p.id,
        p.title,
        p.description,
        p.required_verification_tier,
        p.signature_goal
      `,
      [petitionId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Petition not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch petition" });
  }
};

/* ------------------------------
   SIGN petition (tier enforced)
------------------------------ */
exports.signPetition = async (req, res) => {
  const petitionId = Number(req.params.id);
  const { userId } = req.body;

  // -------------------------
  // 1️⃣ Basic validation FIRST
  // -------------------------
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  if (!petitionId || isNaN(petitionId)) {
    return res.status(400).json({ error: "Invalid petition ID" });
  }

  try {
    // -------------------------
    // 2️⃣ Prevent repeat signing
    // -------------------------
    const existing = await pool.query(
      `
      SELECT 1
      FROM petition_participation
      WHERE user_id = $1 AND petition_id = $2
      `,
      [userId, petitionId]
    );

    if (existing.rowCount > 0) {
      return res.status(403).json({
        error: "User has already signed this petition",
      });
    }

    // -------------------------
    // 3️⃣ Get user verification tier
    // -------------------------
    const userResult = await pool.query(
      `SELECT verification_tier FROM users WHERE id = $1`,
      [userId]
    );

    if (!userResult.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    // -------------------------
    // 4️⃣ Get petition requirement
    // -------------------------
    const petitionResult = await pool.query(
      `
      SELECT required_verification_tier
      FROM petitions
      WHERE id = $1
      `,
      [petitionId]
    );

    if (!petitionResult.rows.length) {
      return res.status(404).json({ error: "Petition not found" });
    }

    const userTier = userResult.rows[0].verification_tier;
    const requiredTier = petitionResult.rows[0].required_verification_tier;

    if (userTier < requiredTier) {
      return res.status(403).json({
        error: "Insufficient verification level",
        requiredTier,
      });
    }

    // -------------------------
    // 5️⃣ Create one-time anonymous token
    // -------------------------
    const token = crypto.randomBytes(32).toString("hex");

    await pool.query(
      `
      INSERT INTO action_tokens (
        token_hash,
        action_type,
        petition_id,
        expires_at
      )
      VALUES ($1, 'petition_sign', $2, NOW() + INTERVAL '10 minutes')
      `,
      [token, petitionId]
    );

    // -------------------------
    // 6️⃣ Record signature anonymously
    // -------------------------
    await pool.query(
      `
      INSERT INTO petition_signatures (petition_id, token_hash)
      VALUES ($1, $2)
      `,
      [petitionId, token]
    );

    // -------------------------
    // 7️⃣ Burn token
    // -------------------------
    await pool.query(
      `
      UPDATE action_tokens
      SET used = TRUE
      WHERE token_hash = $1
      `,
      [token]
    );

    // -------------------------
    // 8️⃣ Record participation (NO identity linkage)
    // -------------------------
    await pool.query(
      `
      INSERT INTO petition_participation (user_id, petition_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [userId, petitionId]
    );

    return res.json({ success: true });

  } catch (err) {
    console.error("Sign petition failed:", err);
    return res.status(500).json({ error: "Failed to sign petition" });
  }
};