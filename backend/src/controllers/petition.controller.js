const crypto = require("crypto");
const pool = require("../db/pool");

/* ------------------------------
   GET all petition categories
------------------------------ */
exports.getCategories = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, title, description
      FROM petition_categories
      ORDER BY title
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

/* ------------------------------
   GET petitions by category
------------------------------ */
exports.getByCategory = async (req, res) => {
  const categoryId = Number(req.params.id);

  try {
    const { rows } = await pool.query(
      `
      SELECT
        p.id,
        p.title,
        p.description,
        p.required_verification_level,
        COUNT(ps.id) AS signatures
      FROM petitions p
      LEFT JOIN petition_signatures ps ON ps.petition_id = p.id
      WHERE p.category_id = $1
      GROUP BY p.id
      ORDER BY p.created_at DESC
      `,
      [categoryId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch petitions" });
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
        p.required_verification_level,
        COUNT(ps.id) AS signatures
      FROM petitions p
      LEFT JOIN petition_signatures ps ON ps.petition_id = p.id
      WHERE p.id = $1
      GROUP BY p.id
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
  const userId = Number(req.body.userId);

  if (!userId) {
    return res.status(401).json({ error: "Missing user" });
  }

  try {
    // 1️⃣ Get user verification level
    const userResult = await pool.query(
      `SELECT verification_level FROM users WHERE id = $1`,
      [userId]
    );

    if (!userResult.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2️⃣ Get petition requirement
    const petitionResult = await pool.query(
      `SELECT required_verification_level FROM petitions WHERE id = $1`,
      [petitionId]
    );

    if (!petitionResult.rows.length) {
      return res.status(404).json({ error: "Petition not found" });
    }

    const userTier = userResult.rows[0].verification_level;
    const requiredTier = petitionResult.rows[0].required_verification_level;

    if (userTier < requiredTier) {
      return res.status(403).json({
        error: "Insufficient verification level",
        requiredTier,
      });
    }

    // 3️⃣ Generate one-time action token
    const tokenHash = crypto
      .createHash("sha256")
      .update(`petition:${petitionId}:${userId}:${Date.now()}`)
      .digest("hex");

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
      [tokenHash, petitionId]
    );

    // 4️⃣ Record signature
    await pool.query(
      `
      INSERT INTO petition_signatures (petition_id, token_hash)
      VALUES ($1, $2)
      `,
      [petitionId, tokenHash]
    );

    // 5️⃣ Track participation (anti-repeat)
    await pool.query(
      `
      INSERT INTO petition_participation (user_id, petition_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [userId, petitionId]
    );

    // 6️⃣ Burn token
    await pool.query(
      `
      UPDATE action_tokens
      SET used = TRUE
      WHERE token_hash = $1
      `,
      [tokenHash]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to sign petition" });
  }
};