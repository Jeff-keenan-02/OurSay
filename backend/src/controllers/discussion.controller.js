const pool = require('../db/pool');

/**
 * GET /discussions/categories
 * Returns all discussion categories
 */
exports.getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, description
       FROM discussion_categories
       ORDER BY id ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getCategories:', err);
    res.status(500).json({ error: 'Failed to load categories' });
  }
};

/**
 * GET /discussions/by-category/:categoryId
 */
exports.getByCategory = async (req, res) => {
  const { categoryId } = req.params;

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
      WHERE d.category_id = $1
      ORDER BY d.created_at DESC
      `,
      [categoryId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('getByCategory:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /discussions/:id
 */
exports.getDiscussion = async (req, res) => {
  const { id } = req.params;

  try {
    const discussionResult = await pool.query(
      `
      SELECT id, title, body, created_at
      FROM discussions
      WHERE id = $1
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
        c.verification_tier
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
      LIMIT 2
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
  const { body, userId } = req.body;

  if (!body || body.trim() === '') {
    return res.status(400).json({ error: 'Comment body is required' });
  }

  try {
    // 🔐 get user's current verification tier
    const userResult = await pool.query(
      `SELECT verification_level FROM users WHERE id = $1`,
      [userId]
    );

    const verificationTier = userResult.rows[0]?.verification_level ?? 0;

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
 * POST /discussions/:id/vote
 */
exports.voteDiscussion = async (req, res) => {
  const { id } = req.params;
  const { userId, direction } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

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
      upvotes: counts.rows[0].upvotes,
      downvotes: counts.rows[0].downvotes
    });
  } catch (err) {
    console.error('voteDiscussion:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};