// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const crypto = require('crypto');

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

// ---------- EXISTING POLLS ROUTE ----------
app.get('/polls', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM polls ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error in /polls:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// // ---------- DISCUSSIONS ROUTES ----------
// // GET /discussions/:id  → return one discussion + all comments
// app.get('/discussions/:id', async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Fetch the discussion
//     const discussionResult = await pool.query(
//       `SELECT id, title, body, created_at
//        FROM discussions
//        WHERE id = $1`,
//       [id]
//     );

//     if (discussionResult.rowCount === 0) {
//       return res.status(404).json({ error: 'Discussion not found' });
//     }

//     // Fetch all comments for the discussion
//     const commentsResult = await pool.query(
//       `SELECT id, body, created_at
//        FROM comments
//        WHERE discussion_id = $1
//        ORDER BY created_at ASC`,
//       [id]
//     );

//     res.json({
//       ...discussionResult.rows[0],
//       comments: commentsResult.rows
//     });

//   } catch (err) {
//     console.error("Error in GET /discussions/:id:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // GET /discussions -> list with counts
// app.get('/discussions', async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT
//         d.id,
//         d.title,
//         d.body,
//         COALESCE(SUM(CASE WHEN v.value = 1 THEN 1 ELSE 0 END), 0) AS upvotes,
//         COALESCE(SUM(CASE WHEN v.value = -1 THEN 1 ELSE 0 END), 0) AS downvotes,
//         COUNT(DISTINCT c.id) AS comment_count
//       FROM discussions d
//       LEFT JOIN discussion_votes v ON v.discussion_id = d.id
//       LEFT JOIN comments c ON c.discussion_id = d.id
//       GROUP BY d.id
//       ORDER BY d.created_at DESC;
//     `);

//     res.json(result.rows);
//   } catch (err) {
//     console.error('Error in GET /discussions:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // POST /discussions/:id/comments  { body }
// app.post('/discussions/:id/comments', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { body } = req.body;

//     if (!body || body.trim() === '') {
//       return res.status(400).json({ error: 'Comment body is required' });
//     }

//     const result = await pool.query(
//       `INSERT INTO comments (discussion_id, user_id, body)
//        VALUES ($1, NULL, $2)  -- user_id NULL for now (anonymous)
//        RETURNING id, body, created_at`,
//       [id, body.trim()]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error('Error in POST /discussions/:id/comments:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // POST /discussions/:id/vote  { userId, direction: 'up' | 'down' }
// app.post('/discussions/:id/vote', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { userId, direction } = req.body;

//     if (!userId) {
//       return res.status(400).json({ error: 'userId is required (temporary until auth wired)' });
//     }

//     if (!['up', 'down'].includes(direction)) {
//       return res.status(400).json({ error: 'direction must be "up" or "down"' });
//     }

//     const value = direction === 'up' ? 1 : -1;

//     // Upsert user’s vote
//     await pool.query(
//       `
//       INSERT INTO discussion_votes (discussion_id, user_id, value)
//       VALUES ($1, $2, $3)
//       ON CONFLICT (discussion_id, user_id)
//       DO UPDATE SET value = EXCLUDED.value
//       `,
//       [id, userId, value]
//     );

//     // Return updated counts
//     const counts = await pool.query(
//       `
//       SELECT
//         COALESCE(SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END), 0) AS upvotes,
//         COALESCE(SUM(CASE WHEN value = -1 THEN 1 ELSE 0 END), 0) AS downvotes
//       FROM discussion_votes
//       WHERE discussion_id = $1
//       `,
//       [id]
//     );

//     res.json({
//       id: Number(id),
//       upvotes: counts.rows[0].upvotes,
//       downvotes: counts.rows[0].downvotes
//     });
//   } catch (err) {
//     console.error('Error in POST /discussions/:id/vote:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


// // GET /discussions/:id/comments
// app.get('/discussions/:id/comments', async (req, res) => {
//   try {
//     const { id } = req.params;

//     const result = await pool.query(
//       `SELECT id, body, created_at
//        FROM comments
//        WHERE discussion_id = $1
//        ORDER BY created_at ASC`,
//       [id]
//     );

//     res.json(result.rows);
//   } catch (err) {
//     console.error("Error in GET /discussions/:id/comments:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });
// ---------- DISCUSSIONS ROUTES ----------

// GET /discussions/:id  → return one discussion + all comments
app.get('/discussions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the discussion
    const discussionResult = await pool.query(
      `SELECT id, title, body, created_at
       FROM discussions
       WHERE id = $1`,
      [id]
    );

    if (discussionResult.rowCount === 0) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    // Fetch all comments for this discussion
    const commentsResult = await pool.query(
      `SELECT id, body, created_at
       FROM comments
       WHERE discussion_id = $1
       ORDER BY created_at ASC`,
      [id]
    );

    res.json({
      ...discussionResult.rows[0],
      comments: commentsResult.rows
    });

  } catch (err) {
    console.error("Error in GET /discussions/:id:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// GET /discussions → list all with vote + comment counts
app.get('/discussions', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        d.id,
        d.title,
        d.body,
        COALESCE(SUM(CASE WHEN v.value = 1 THEN 1 END), 0) AS upvotes,
        COALESCE(SUM(CASE WHEN v.value = -1 THEN 1 END), 0) AS downvotes,
        COUNT(DISTINCT c.id) AS comment_count
      FROM discussions d
      LEFT JOIN discussion_votes v ON v.discussion_id = d.id
      LEFT JOIN comments c ON c.discussion_id = d.id
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `);

    res.json(result.rows);

  } catch (err) {
    console.error('Error in GET /discussions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// POST /discussions/:id/comments  { body }
app.post('/discussions/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req.body;

    if (!body || body.trim() === '') {
      return res.status(400).json({ error: 'Comment body is required' });
    }

    const result = await pool.query(
      `INSERT INTO comments (discussion_id, user_id, body)
       VALUES ($1, NULL, $2)
       RETURNING id, body, created_at`,
      [id, body.trim()]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error('Error in POST /discussions/:id/comments:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// POST /discussions/:id/vote  { userId, direction }
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

    // Insert or update user’s vote
    await pool.query(
      `INSERT INTO discussion_votes (discussion_id, user_id, value)
       VALUES ($1, $2, $3)
       ON CONFLICT (discussion_id, user_id)
       DO UPDATE SET value = EXCLUDED.value`,
      [id, userId, value]
    );

    // Get updated totals
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


// GET /discussions/:id/comments
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






app.listen(3000, () => console.log('Backend running on port 3000'));

