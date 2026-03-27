const crypto = require("crypto");
const pool = require("../db/pool");
const petitionService = require('../services/petition.service');


/* ------------------------------
   GET trending by Petiton
------------------------------ */
exports.getTrendingPetition = async (req, res) => {
  const userId = req.user.id;
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
        END AS progress,
        EXISTS (
          SELECT 1 FROM petition_participation pp
          WHERE pp.petition_id = p.id AND pp.user_id = $1
        ) AS has_signed
      FROM petitions p
      LEFT JOIN petition_signatures ps
        ON ps.petition_id = p.id
      GROUP BY p.id, p.title, p.description, p.required_verification_tier, p.signature_goal
      ORDER BY signatures DESC
      LIMIT 3;
    `, [userId]);

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
  const userId = req.user.id;
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.title,
        p.description,
        p.signature_goal,
        p.required_verification_tier,
        COUNT(ps.id)::int AS signatures,
        CASE
          WHEN p.signature_goal = 0 THEN 0
          ELSE COUNT(ps.id)::float / p.signature_goal
        END AS progress,
        EXISTS (
          SELECT 1 FROM petition_participation pp
          WHERE pp.petition_id = p.id AND pp.user_id = $1
        ) AS has_signed
      FROM petitions p
      JOIN topics t ON t.id = p.topic_id
      LEFT JOIN petition_signatures ps
        ON ps.petition_id = p.id
      WHERE t.source = 'weekly'
      GROUP BY p.id, p.title, p.description, p.required_verification_tier, p.signature_goal
      ORDER BY p.created_at DESC
      LIMIT 1;
    `, [userId]);

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
  const userId = req.user.id;

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
        p.required_verification_tier,
        COUNT(ps.id)::int AS signatures,
        CASE
          WHEN p.signature_goal = 0 THEN 0
          ELSE COUNT(ps.id)::float / p.signature_goal
        END AS progress,
        EXISTS (
          SELECT 1 FROM petition_participation pp
          WHERE pp.petition_id = p.id AND pp.user_id = $2
        ) AS has_signed
      FROM petitions p
      LEFT JOIN petition_signatures ps ON ps.petition_id = p.id
      WHERE p.topic_id = $1
      GROUP BY p.id, p.title, p.description, p.signature_goal, p.required_verification_tier
      ORDER BY p.created_at DESC;
      `,
      [topicId, userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("getPetitionsByTopic:", err);
    res.status(500).json({ error: "Failed to load petitions for topic" });
  }
};


/* ------------------------------
   Post a single petition
------------------------------ */
exports.createPetition = async (req, res) => {
  try {
    const {
      title,
      description,
      required_verification_tier,
      signature_goal,
    } = req.body;

    // 🔒 Basic Validation
    if (!title || !description) {
      return res.status(400).json({
        error: "Title and description are required",
      });
    }

    if (![2, 3].includes(required_verification_tier)) {
      return res.status(400).json({
        error: "Invalid verification tier",
      });
    }

    if (
      !signature_goal ||
      isNaN(signature_goal) ||
      Number(signature_goal) <= 0
    ) {
      return res.status(400).json({
        error: "Signature goal must be a positive number",
      });
    }

    // 🏛 Hardcoded topic_id = 8
    const topicId = 8;

    const result = await pool.query(
      `
      INSERT INTO petitions (
        topic_id,
        title,
        description,
        required_verification_tier,
        signature_goal
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
      `,
      [
        topicId,
        title.trim(),
        description.trim(),
        required_verification_tier,
        signature_goal,
      ]
    );

    return res.status(201).json({
      id: result.rows[0].id,
    });
  } catch (err) {
    console.error("Create petition error:", err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};


/* ------------------------------
   GET single petition
------------------------------ */
exports.getPetition = async (req, res) => {
  const petitionId = Number(req.params.id);
  const userId = req.user.id;

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
        END AS progress,

        EXISTS (
          SELECT 1
          FROM petition_participation pp
          WHERE pp.petition_id = p.id
          AND pp.user_id = $2
        ) AS has_signed

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
      [petitionId, userId]
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
  const userId = req.user.id;

  if (!petitionId || isNaN(petitionId)) {
    return res.status(400).json({ error: "Invalid petition ID" });
  }

  try {
    const result = await petitionService.signPetition({
      userId,
      petitionId
    });

    return res.json(result);

  } catch (err) {
    return res.status(err.status || 400).json({ error: err.message });
  }
};