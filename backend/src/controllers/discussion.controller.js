const pool = require('../db/pool');


exports.getWeeklyDiscussion = async (req, res) => {

  try {
    const result = await pool.query(`
    SELECT
      d.id,
      d.title,
      d.body,
      u.username AS created_by,
      COUNT(c.id) AS comment_count
    FROM discussions d
    JOIN topics t ON t.id = d.topic_id
    JOIN users u ON u.id = d.created_by
    LEFT JOIN comments c ON c.discussion_id = d.id
    WHERE t.is_weekly = true
    GROUP BY d.id, u.username
    ORDER BY d.created_at DESC
    LIMIT 1;
    `);

    res.json(result.rows[0] ?? null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load weekly discussion" });
  }
};

/**
 * GET /discussions/by-topic/:%topicId
 */
exports.getDisscussionByTopic = async (req, res) => {
  const { topicId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        d.id,
        d.title,
        d.body,
        COALESCE(v.upvotes, 0) AS upvotes,
        COALESCE(v.downvotes, 0) AS downvotes,
        COALESCE(c.comment_count, 0) AS comment_count
      FROM discussions d
      LEFT JOIN (
        SELECT
          discussion_id,
          SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END) AS upvotes,
          SUM(CASE WHEN value = -1 THEN 1 ELSE 0 END) AS downvotes
        FROM discussion_votes
        GROUP BY discussion_id
      ) v ON v.discussion_id = d.id
      LEFT JOIN (
        SELECT discussion_id, COUNT(*) AS comment_count
        FROM comments
        GROUP BY discussion_id
      ) c ON c.discussion_id = d.id
      WHERE d.topic_id = $1
      ORDER BY d.created_at DESC
      `,
      [topicId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('getByTopic:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /discussion/:id
 */
exports.getDiscussion = async (req, res) => {
  const { id } = req.params;

  try {
    const discussionResult = await pool.query(
      `
      SELECT 
        d.id,
        d.title,
        d.body,
        d.created_at,
        u.username AS created_by,
        u.verification_tier
      FROM discussions d
      LEFT JOIN users u ON u.id = d.created_by
      WHERE d.id = $1
      `,
      [id]
    );

    if (discussionResult.rowCount === 0) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    const commentsResult = await pool.query(
      `
      SELECT
        c.id,
        c.body,
        c.created_at,
        u.username,
        u.verification_tier
      FROM comments c
      LEFT JOIN users u ON u.id = c.user_id
      WHERE c.discussion_id = $1
      ORDER BY c.created_at DESC
      `,
      [id]
    );

    res.json({
      ...discussionResult.rows[0],
      comments: commentsResult.rows
    });
  } catch (err) {
    console.error('getDiscussion:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /trendingdiscussions
 */
exports.getTrending = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        d.id,
        d.title,
        d.body,
        COALESCE(v.upvotes, 0) AS upvotes,
        COALESCE(v.downvotes, 0) AS downvotes,
        COALESCE(c.comment_count, 0) AS comment_count
      FROM discussions d
      LEFT JOIN (
        SELECT
          discussion_id,
          SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END) AS upvotes,
          SUM(CASE WHEN value = -1 THEN 1 ELSE 0 END) AS downvotes
        FROM discussion_votes
        GROUP BY discussion_id
      ) v ON v.discussion_id = d.id
      LEFT JOIN (
        SELECT discussion_id, COUNT(*) AS comment_count
        FROM comments
        GROUP BY discussion_id
      ) c ON c.discussion_id = d.id
      ORDER BY upvotes DESC
      LIMIT 3
      `
    );

    res.json(result.rows);
  } catch (err) {
    console.error('getTrending:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /discussions/:id/comments
 */
exports.postComment = async (req, res) => {
  const { id } = req.params;
  const { body } = req.body;
  const userId = req.user.id;

  if (!body || body.trim() === '') {
    return res.status(400).json({ error: 'Comment body is required' });
  }

  try {
    //  get user's current verification tier
    const userResult = await pool.query(
      `SELECT verification_tier FROM users WHERE id = $1`,
      [userId]
    );

    const verificationTier = userResult.rows[0]?.verification_tier ?? 0;

    const result = await pool.query(
      `
      INSERT INTO comments (discussion_id, user_id, body, verification_tier)
      VALUES ($1, $2, $3, $4)
      RETURNING id, body, created_at, verification_tier
      `,
      [id, userId, body.trim(), verificationTier]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('postComment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST a discussions for tier 3 users
 */
exports.createDiscussion = async (req, res) => {
  const { title, body } = req.body;
  const userId = req.user.id;

  const COMMUNITY_TOPIC_ID = 8; // replace with actual ID

  if (!title || !body) {
    return res.status(400).json({ error: 'Title and body are required' });
  }

  if (title.length > 255) {
    return res.status(400).json({ error: 'Title too long' });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO discussions (topic_id, title, body, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING id, title, body, created_at
      `,
      [COMMUNITY_TOPIC_ID, title.trim(), body.trim(), userId]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error('createDiscussion:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /discussions/:id/vote
 */
exports.voteDiscussion = async (req, res) => {
  const { id } = req.params;
  const {direction } = req.body;
  const userId = req.user.id;

  if (!['up', 'down'].includes(direction)) {
    return res.status(400).json({ error: 'direction must be "up" or "down"' });
  }

  const value = direction === 'up' ? 1 : -1;

  try {
    await pool.query(
      `
      INSERT INTO discussion_votes (discussion_id, user_id, value)
      VALUES ($1, $2, $3)
      ON CONFLICT (discussion_id, user_id)
      DO UPDATE SET value = EXCLUDED.value
      `,
      [id, userId, value]
    );

    const counts = await pool.query(
      `
      SELECT
        COALESCE(SUM(CASE WHEN value = 1 THEN 1 END), 0) AS upvotes,
        COALESCE(SUM(CASE WHEN value = -1 THEN 1 END), 0) AS downvotes
      FROM discussion_votes
      WHERE discussion_id = $1
      `,
      [id]
    );

    res.json({
      id: Number(id),
      upvotes: Number(counts.rows[0].upvotes),
      downvotes: Number(counts.rows[0].downvotes)
    });
  } catch (err) {
    console.error('voteDiscussion:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};