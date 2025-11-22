// backend/src/server.js
const cors = require('cors');
const { Pool } = require('pg');
const crypto = require('crypto');


const express = require('express');
const app = express();
app.use(cors());
app.use(express.json());

// Postgres connection
const pool = new Pool({
  host: 'localhost',
  user: 'oursay',
  password: 'RILEY2015',
  database: 'oursaydb',
  port: 5431
});
// --- simple password hashing helper ---
const PASSWORD_SALT = process.env.PASSWORD_SALT || 'dev_salt_change_me';

function hashPassword(password) {
  return crypto
    .createHash('sha256')
    .update(password + PASSWORD_SALT)
    .digest('hex');
}
// ---------- AUTH ROUTES ----------

// POST /signup  { username, password }
app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const password_hash = hashPassword(password);

    const result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at',
      [username, password_hash]
    );

    return res.status(201).json({
      message: 'Signup successful',
      user: result.rows[0]
    });
  } catch (err) {
    // handle duplicate username nicely
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Username already taken' });
    }
    console.error('Error in /signup:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /login  { username, password }
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await pool.query(
      'SELECT id, username, password_hash FROM users WHERE username = $1',
      [username]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = result.rows[0];
    const hashedInput = hashPassword(password);

    if (hashedInput !== user.password_hash) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // For now: just return user info (no JWT yet)
    return res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (err) {
    console.error('Error in /login:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// DISCUSSION SYSTEM ROUTES
// Handles: listing discussions, viewing a single discussion,
// posting comments, and upvote/downvote logic.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// GET /discussions/:id
// → Returns ONE discussion including all comments + commenter usernames.
// ---------------------------------------------------------------------------
app.get('/discussions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch selected discussion
    const discussionResult = await pool.query(
      `SELECT id, title, body, created_at
       FROM discussions
       WHERE id = $1`,
      [id]
    );

    if (discussionResult.rowCount === 0) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    // 2. Fetch all comments for this discussion (with username)
    const commentsResult = await pool.query(
      `SELECT 
          c.id,
          c.body,
          c.created_at,
          u.username
       FROM comments c
       LEFT JOIN users u ON u.id = c.user_id
       WHERE c.discussion_id = $1
       ORDER BY c.created_at ASC`,
      [id]
    );

    // 3. Return discussion + comments
    res.json({
      ...discussionResult.rows[0],
      comments: commentsResult.rows
    });

  } catch (err) {
    console.error("Error in GET /discussions/:id:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// ---------------------------------------------------------------------------
// GET /discussions
// → Returns ALL discussions with upvote/downvote totals + comment counts.
// This is used for the "Discussions List" page.
// ---------------------------------------------------------------------------
app.get('/discussions', async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT
        d.id,
        d.title,
        d.body,

        -- Correct vote totals
        COALESCE(v.upvotes, 0) AS upvotes,
        COALESCE(v.downvotes, 0) AS downvotes,

        -- Correct comment count
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
        SELECT
            discussion_id,
            COUNT(*) AS comment_count
        FROM comments
        GROUP BY discussion_id
        ) c ON c.discussion_id = d.id

        ORDER BY d.created_at DESC;
    `);

    res.json(result.rows);

  } catch (err) {
    console.error('Error in GET /discussions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// ---------------------------------------------------------------------------
// POST /discussions/:id/comments
// → Adds a comment to a discussion.
// TEMP: userId is passed manually until login setup is complete.
// ---------------------------------------------------------------------------
app.post('/discussions/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { body, userId } = req.body;

    if (!body || body.trim() === '') {
      return res.status(400).json({ error: 'Comment body is required' });
    }

    // Default commenter to user 1 if not provided (temporary for FYP)
    const user = userId || 1;

    const result = await pool.query(
      `INSERT INTO comments (discussion_id, user_id, body)
       VALUES ($1, $2, $3)
       RETURNING id, body, created_at`,
      [id, user, body.trim()]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error('Error posting comment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// ---------------------------------------------------------------------------
// POST /discussions/:id/vote
// → Add or update a user's upvote/downvote.
// Ensures: one vote per user per discussion.
// ---------------------------------------------------------------------------
app.post('/discussions/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, direction } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required (temporary)' });
    }

    if (!['up', 'down'].includes(direction)) {
      return res.status(400).json({ error: 'direction must be "up" or "down"' });
    }

    const value = direction === 'up' ? 1 : -1;

    // UPSERT vote - ensures user can only vote once
    await pool.query(
      `INSERT INTO discussion_votes (discussion_id, user_id, value)
       VALUES ($1, $2, $3)
       ON CONFLICT (discussion_id, user_id)
       DO UPDATE SET value = EXCLUDED.value`,
      [id, userId, value]
    );

    // Return updated total vote counts
    const counts = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN value = 1 THEN 1 END), 0) AS upvotes,
         COALESCE(SUM(CASE WHEN value = -1 THEN 1 END), 0) AS downvotes
       FROM discussion_votes
       WHERE discussion_id = $1`,
      [id]
    );

    res.json({
      id: Number(id),
      upvotes: counts.rows[0].upvotes,
      downvotes: counts.rows[0].downvotes
    });

  } catch (err) {
    console.error('Error in POST /discussions/:id/vote:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// ---------------------------------------------------------------------------
// GET /discussions/:id/comments
// → Fetch all comments for a discussion (lightweight version).
// Used only if you need comments without the parent discussion.
// ---------------------------------------------------------------------------
app.get('/discussions/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, body, created_at
       FROM comments
       WHERE discussion_id = $1
       ORDER BY created_at ASC`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error("Error in GET /discussions/:id/comments:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// ---------------------------------------------------------------------------
// GET /polls
// ---------------------------------------------------------------------------

app.get('/polls', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.title,
        p.description,
        COALESCE(SUM(CASE WHEN v.choice = 'yes' THEN 1 END), 0) AS votes_yes,
        COALESCE(SUM(CASE WHEN v.choice = 'no' THEN 1 END), 0) AS votes_no
      FROM polls p
      LEFT JOIN poll_votes v ON v.poll_id = p.id
      GROUP BY p.id
      ORDER BY p.created_at DESC;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error in GET /polls:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/polls/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, choice } = req.body;

    if (!['yes', 'no'].includes(choice)) {
      return res.status(400).json({ error: "choice must be 'yes' or 'no'" });
    }

    if (!userId) {
      return res.status(400).json({ error: "userId is required (temporary)" });
    }

    // UPSERT (users cannot vote twice)
    await pool.query(`
      INSERT INTO poll_votes (poll_id, user_id, choice)
      VALUES ($1, $2, $3)
      ON CONFLICT (poll_id, user_id)
      DO UPDATE SET choice = EXCLUDED.choice
    `, [id, userId, choice]);

    res.json({ success: true });
  } catch (err) {
    console.error("Error in POST /polls/:id/vote:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3000, () => console.log('Backend running on port 3000'));

