// controllers/poll.controller.js
const pool = require('../db/pool');
const crypto = require('crypto');

exports.votePoll = async (req, res) => {
  const pollId = parseInt(req.params.id);
  const { choice, userId } = req.body;

  //  basic validation FIRST
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  if (!['yes', 'no'].includes(choice)) {
    return res.status(400).json({ error: 'Invalid choice' });
  }

  try {
    //  prevent repeat voting BEFORE token creation
    const existing = await pool.query(`
      SELECT 1
      FROM poll_participation
      WHERE user_id = $1 AND poll_id = $2
    `, [userId, pollId]);

    if (existing.rowCount > 0) {
      return res.status(403).json({
        error: 'User has already voted in this poll'
      });
    }

    // 1. create one-time anonymous token
    const token = crypto.randomBytes(32).toString('hex');

    await pool.query(`
      INSERT INTO action_tokens (token_hash, action_type, poll_id, expires_at)
      VALUES ($1, 'poll_vote', $2, NOW() + INTERVAL '10 minutes')
    `, [token, pollId]);

    // 2. record vote anonymously
    await pool.query(`
      INSERT INTO poll_votes (poll_id, token_hash, choice)
      VALUES ($1, $2, $3)
    `, [pollId, token, choice]);

    // 3. burn token
    await pool.query(`
      UPDATE action_tokens
      SET used = TRUE
      WHERE token_hash = $1
    `, [token]);

    // 4. record participation (NO opinion data)
    await pool.query(`
      INSERT INTO poll_participation (user_id, poll_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `, [userId, pollId]);

    // update GROUP progress
    await pool.query(`
      INSERT INTO poll_group_progress (user_id, poll_group_id, status, completed_polls)
      SELECT
        $1,
        p.poll_group_id,
        CASE
          WHEN COUNT(pp.poll_id) = COUNT(p.id) THEN 2
          ELSE 1
        END,
        COUNT(pp.poll_id)
      FROM polls p
      LEFT JOIN poll_participation pp
        ON pp.poll_id = p.id AND pp.user_id = $1
      WHERE p.poll_group_id = (
        SELECT poll_group_id FROM polls WHERE id = $2
      )
      GROUP BY p.poll_group_id
      ON CONFLICT (user_id, poll_group_id)
      DO UPDATE SET
        status = EXCLUDED.status,
        completed_polls = EXCLUDED.completed_polls,
        updated_at = NOW();
    `, [userId, pollId]);

    return res.json({ success: true });

  } catch (err) {
    console.error('Vote failed:', err);
    return res.status(500).json({ error: err.message });
  }
};

exports.getProgress = async (req, res) => {
  const userId = Number(req.query.userId);
  const pollGroupId = Number(req.params.pollGroupId);

  try {
    const progress = await pool.query(`
      SELECT status, completed_polls
      FROM poll_group_progress
      WHERE user_id = $1 AND poll_group_id = $2
    `, [userId, pollGroupId]);

    const total = await pool.query(`
      SELECT COUNT(*) FROM polls WHERE poll_group_id = $1
    `, [pollGroupId]);

    res.json({
      status: progress.rows[0]?.status ?? 0,
      completed_polls: progress.rows[0]?.completed_polls ?? 0,
      total_polls: Number(total.rows[0].count)
    });

  } catch {
    res.status(500).json({ error: 'Failed to load progress' });
  }
};


exports.updateProgress = async (req, res) => {
  const userId = parseInt(req.body.userId);
  const pollGroupId = parseInt(req.params.pollGroupId);

  try {
    const totalRes = await pool.query(`
      SELECT COUNT(*) FROM polls WHERE poll_group_id = $1
    `, [pollGroupId]);

    const completedRes = await pool.query(`
      SELECT COUNT(*) 
      FROM poll_participation
      WHERE user_id = $1
      AND poll_id IN (
        SELECT id FROM polls WHERE poll_group_id = $2
      )
    `, [userId, pollGroupId]);

    const total = Number(totalRes.rows[0].count);
    const completed = Number(completedRes.rows[0].count);

    const status =
      completed === 0 ? 0 :
      completed < total ? 1 : 2;

    await pool.query(`
      INSERT INTO poll_group_progress (user_id, poll_group_id, status, completed_polls)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, poll_group_id)
      DO UPDATE SET
        status = EXCLUDED.status,
        completed_polls = EXCLUDED.completed_polls,
        updated_at = NOW()
    `, [userId, pollGroupId, status, completed]);

    res.json({ status, completed_polls: completed });

  } catch (err) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
};


exports.getWeeklyPoll = async (req, res) => {
  const userId = Number(req.query.userId);

  try {
    const result = await pool.query(`
      SELECT
        pg.id,
        pg.title,
        t.title AS topic_title,
        COUNT(p.id) AS total_polls,
        COALESCE(pgp.completed_polls, 0) AS completed_polls,
        CASE
          WHEN COALESCE(pgp.completed_polls, 0) = 0 THEN 0
          WHEN COALESCE(pgp.completed_polls, 0) < COUNT(p.id) THEN 1
          ELSE 2
        END AS status
      FROM poll_groups pg
      JOIN topics t ON t.id = pg.topic_id
      LEFT JOIN polls p ON p.poll_group_id = pg.id
      LEFT JOIN poll_group_progress pgp
        ON pgp.poll_group_id = pg.id AND pgp.user_id = $1
      WHERE pg.is_weekly = true
      GROUP BY pg.id, t.title, pgp.completed_polls
      LIMIT 1;
    `, [userId]);

    res.json(result.rows[0] ?? null);

  } catch {
    res.status(500).json({ error: 'Failed to load weekly poll' });
  }
};

exports.getTrendingPoll = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.question,
        p.description,
        COUNT(v.id) AS vote_count
      FROM polls p
      LEFT JOIN poll_votes v ON v.poll_id = p.id
      GROUP BY p.id
      ORDER BY vote_count DESC
      LIMIT 1;
    `);

    res.json(result.rows[0] ?? null);

  } catch (err) {
    console.error("getTrendingPoll:", err);
    res.status(500).json({ error: "Failed to load trending poll" });
  }
};

exports.getPollGroupsByTopic = async (req, res) => {
  const userId = Number(req.query.userId);
  const topicId = Number(req.params.topicId);

  try {
    const result = await pool.query(`
      SELECT
        pg.id,
        pg.title,

        COUNT(DISTINCT p.id) AS total_polls,
        COALESCE(pgp.completed_polls, 0) AS completed_polls,

        CASE
          WHEN COALESCE(pgp.completed_polls, 0) = 0 THEN 0
          WHEN COALESCE(pgp.completed_polls, 0) < COUNT(DISTINCT p.id) THEN 1
          ELSE 2
        END AS status

      FROM poll_groups pg
      LEFT JOIN polls p ON p.poll_group_id = pg.id
      LEFT JOIN poll_group_progress pgp
        ON pgp.poll_group_id = pg.id AND pgp.user_id = $1

      WHERE pg.topic_id = $2
      GROUP BY pg.id, pg.title, pgp.completed_polls
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

  try {
    const result = await pool.query(
      `
      SELECT 
        id,
        question,
        description,
        required_verification_tier
      FROM polls
      WHERE poll_group_id = $1
      ORDER BY id
      `,
      [pollGroupId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error("getPollsByGroup:", err);
    res.status(500).json({ error: "Failed to load polls" });
  }
};