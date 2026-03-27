// controllers/poll.controller.js
const pool = require('../db/pool');
const crypto = require('crypto');
const pollService = require('../services/poll.service');
const verificationService = require('../services/verification.service');

exports.getWeeklyPoll = async (req, res) => {
  const userId = req.user.id; // 🔒 never from query

  try {
    const result = await pool.query(`
      SELECT
        pg.id,
        pg.title,
        pg.required_verification_tier,

        COUNT(DISTINCT p.id) AS total_polls,
        COUNT(DISTINCT pp.poll_id) AS completed_polls,

        CASE
          WHEN COUNT(DISTINCT p.id) = 0 THEN 0
          ELSE COUNT(DISTINCT pp.poll_id)::float
               / COUNT(DISTINCT p.id)
        END AS progress,

        CASE
          WHEN COUNT(DISTINCT pp.poll_id) = 0 THEN 0
          WHEN COUNT(DISTINCT pp.poll_id) < COUNT(DISTINCT p.id) THEN 1
          ELSE 2
        END AS status,

        (
          SELECT COUNT(DISTINCT pv.token_hash)
          FROM polls p2
          JOIN poll_votes pv ON pv.poll_id = p2.id
          WHERE p2.poll_group_id = pg.id
        ) AS respondent_count


      FROM poll_groups pg
      JOIN topics t ON t.id = pg.topic_id
      LEFT JOIN polls p ON p.poll_group_id = pg.id
      LEFT JOIN poll_participation pp
        ON pp.poll_id = p.id
        AND pp.user_id = $1

      WHERE t.source = 'weekly'
      GROUP BY pg.id, pg.title, pg.required_verification_tier
      ORDER BY pg.created_at DESC
      LIMIT 1;
    `, [userId]);

    res.json(result.rows[0] ?? null);

  } catch (err) {
    console.error("getWeeklyPoll error:", err);
    res.status(500).json({ error: "Failed to load weekly poll" });
  }
};

exports.getTrendingPoll = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(`
      SELECT
        pg.id,
        pg.title,
        pg.required_verification_tier,

        COUNT(DISTINCT p.id) AS total_polls,
        COUNT(DISTINCT pp.poll_id) AS completed_polls,

        CASE
          WHEN COUNT(DISTINCT p.id) = 0 THEN 0
          ELSE COUNT(DISTINCT pp.poll_id)::float
               / COUNT(DISTINCT p.id)
        END AS progress,

        CASE
          WHEN COUNT(DISTINCT pp.poll_id) = 0 THEN 0
          WHEN COUNT(DISTINCT pp.poll_id) < COUNT(DISTINCT p.id) THEN 1
          ELSE 2
        END AS status,

        (
          SELECT COUNT(DISTINCT pv.token_hash)
          FROM polls p2
          JOIN poll_votes pv ON pv.poll_id = p2.id
          WHERE p2.poll_group_id = pg.id
        ) AS respondent_count


      FROM poll_groups pg
      LEFT JOIN polls p
        ON p.poll_group_id = pg.id
      LEFT JOIN poll_participation pp
        ON pp.poll_id = p.id
        AND pp.user_id = $1

      GROUP BY pg.id, pg.title, pg.required_verification_tier
      ORDER BY progress DESC
      LIMIT 3;
    `, [userId]);

    res.json(result.rows);

  } catch (err) {
    console.error("getTrendingPoll:", err);
    res.status(500).json({ error: "Failed to load trending poll" });
  }
};


exports.getPollGroupsByTopic = async (req, res) => {
  const userId = req.user.id; // 🔒 never from query
  const topicId = Number(req.params.topicId);

  if (!topicId || isNaN(topicId)) {
    return res.status(400).json({ error: 'Invalid topic ID' });
  }

  try {
    const result = await pool.query(`
      SELECT
        pg.id,
        pg.title,
        pg.required_verification_tier,

        COUNT(DISTINCT p.id) AS total_polls,
        COUNT(DISTINCT pp.poll_id) AS completed_polls,

        CASE
          WHEN COUNT(DISTINCT pp.poll_id) = 0 THEN 0
          WHEN COUNT(DISTINCT pp.poll_id) < COUNT(DISTINCT p.id) THEN 1
          ELSE 2
        END AS status,

        CASE
          WHEN COUNT(DISTINCT p.id) = 0 THEN 0
          ELSE COUNT(DISTINCT pp.poll_id)::float
               / COUNT(DISTINCT p.id)
        END AS progress

      FROM poll_groups pg
      LEFT JOIN polls p
        ON p.poll_group_id = pg.id
      LEFT JOIN poll_participation pp
        ON pp.poll_id = p.id
        AND pp.user_id = $1

      WHERE pg.topic_id = $2
      GROUP BY pg.id, pg.title, pg.required_verification_tier
      ORDER BY pg.id;
    `, [userId, topicId]);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load poll groups' });
  }
};


exports.getPollsByGroup = async (req, res) => {
  const pollGroupId = Number(req.params.pollGroupId);
  const userId = req.user.id;

  try {
    // 1️⃣ Get user's effective tier
    const { effectiveTier } =
      await verificationService.getVotingIdentity(userId);

    // 2️⃣ Get group required tier
    const groupResult = await pool.query(
      `
      SELECT required_verification_tier
      FROM poll_groups
      WHERE id = $1
      `,
      [pollGroupId]
    );

    if (!groupResult.rows.length) {
      return res.status(404).json({ error: "Poll group not found" });
    }

    const { required_verification_tier } = groupResult.rows[0];

    // 3️⃣ Enforce tier check
    if (effectiveTier < required_verification_tier) {
      return res.status(403).json({
        error: "Insufficient verification level"
      });
    }

    // 4️⃣ Fetch polls if allowed
    const result = await pool.query(
      `
      SELECT 
        p.id,
        p.question,
        p.description,

        EXISTS (
          SELECT 1
          FROM poll_participation pp
          WHERE pp.poll_id = p.id
          AND pp.user_id = $2
        ) AS has_voted

      FROM polls p
      WHERE p.poll_group_id = $1
      ORDER BY p.id
      `,
      [pollGroupId, userId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error("getPollsByGroup:", err);
    res.status(500).json({ error: "Failed to load polls" });
  }
};


// Vote on a poll
exports.votePoll = async (req, res) => {
  const pollId = parseInt(req.params.id);
  const { choice } = req.body;
  const userId = req.user.id; // FROM JWT

  if (!['yes', 'no'].includes(choice)) {
    return res.status(400).json({ error: 'Invalid choice' });
  }

  try {
    const result = await pollService.votePoll({
      userId,
      pollId,
      choice
    });

    res.json(result);

  } catch (err) {
    return res.status(err.status || 400).json({ error: err.message });
  }
};