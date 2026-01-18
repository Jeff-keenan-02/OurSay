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

    return res.json({ success: true });

  } catch (err) {
    console.error('Vote failed:', err);
    return res.status(500).json({ error: 'Vote failed' });
  }
};

exports.getProgress = async (req, res) => {
  const userId = parseInt(req.query.userId);
  const topicId = parseInt(req.params.topicId);

  try {
    const progress = await pool.query(`
      SELECT status, completed_polls
      FROM poll_topic_progress
      WHERE user_id = $1 AND topic_id = $2
    `, [userId, topicId]);

    const total = await pool.query(`
      SELECT COUNT(*) FROM polls WHERE topic_id = $1
    `, [topicId]);

    res.json({
      status: progress.rows[0]?.status ?? 0,
      completed_polls: progress.rows[0]?.completed_polls ?? 0,
      total_polls: Number(total.rows[0].count)
    });

  } catch (err) {
    res.status(500).json({ error: 'Failed to load progress' });
  }
};


exports.updateProgress = async (req, res) => {
  const userId = parseInt(req.body.userId);
  const topicId = parseInt(req.params.topicId);

  try {
    const totalRes = await pool.query(`
      SELECT COUNT(*) FROM polls WHERE topic_id = $1
    `, [topicId]);

    const completedRes = await pool.query(`
      SELECT COUNT(*) 
      FROM poll_participation
      WHERE user_id = $1
      AND poll_id IN (
        SELECT id FROM polls WHERE topic_id = $2
      )
    `, [userId, topicId]);

    const total = Number(totalRes.rows[0].count);
    const completed = Number(completedRes.rows[0].count);

    const status =
      completed === 0 ? 0 :
      completed < total ? 1 : 2;

    await pool.query(`
      INSERT INTO poll_topic_progress (user_id, topic_id, status, completed_polls)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, topic_id)
      DO UPDATE SET
        status = EXCLUDED.status,
        completed_polls = EXCLUDED.completed_polls,
        updated_at = NOW()
    `, [userId, topicId, status, completed]);

    res.json({ status, completed_polls: completed });

  } catch (err) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
};


exports.getWeeklyPoll = async (req, res) => {
  const userId = parseInt(req.query.userId);

  try {
    const result = await pool.query(`
      SELECT
        pt.id,
        pt.title,
        pt.description,
        COUNT(p.id) AS total_polls,
        COALESCE(pp.completed_polls, 0) AS completed_polls,
        0 AS status,
        TRUE AS is_weekly
      FROM poll_topics pt
      LEFT JOIN polls p ON p.topic_id = pt.id
      LEFT JOIN poll_topic_progress pp
        ON pp.topic_id = pt.id AND pp.user_id = $1
      WHERE pt.is_weekly = true
      GROUP BY pt.id, pp.completed_polls
      LIMIT 1;
    `, [userId]);

    res.json(result.rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load weekly poll' });
  }
};


exports.getPollTopics = async (req, res) => {
  const userId = parseInt(req.query.userId);

  try {
    const result = await pool.query(`
      SELECT
        pt.id,
        pt.title,
        pt.description,
        COUNT(p.id) AS total_polls,
        COALESCE(pp.completed_polls, 0) AS completed_polls,
        CASE
          WHEN COALESCE(pp.completed_polls, 0) = 0 THEN 0
          WHEN COALESCE(pp.completed_polls, 0) < COUNT(p.id) THEN 1
          ELSE 2
        END AS status,
        FALSE AS is_weekly
      FROM poll_topics pt
      LEFT JOIN polls p ON p.topic_id = pt.id
      LEFT JOIN poll_topic_progress pp
        ON pp.topic_id = pt.id AND pp.user_id = $1
      WHERE pt.is_weekly = false
      GROUP BY pt.id, pp.completed_polls
      ORDER BY pt.id;
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load topics' });
  }
};



exports.getPollsByTopic = async (req, res) => {
  const topicId = parseInt(req.params.topicId);

  try {
    const result = await pool.query(`
      SELECT id, title, description
      FROM polls
      WHERE topic_id = $1
      ORDER BY id
    `, [topicId]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load polls' });
  }
};