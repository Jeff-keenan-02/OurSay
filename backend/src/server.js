// // backend/src/server.js
// const cors = require('cors');
// const { Pool } = require('pg');
// const crypto = require('crypto');
// const express = require('express');
// const multer = require('multer');
// const axios = require('axios');
// const FormData = require('form-data');
// const { parse } = require('mrz');

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Postgres connection
// const pool = new Pool({
//   host: 'localhost',
//   user: 'oursay',
//   password: 'RILEY2015',
//   database: 'oursaydb',
//   port: 5431
// });

// // ---------------------------------------------------------------------------
// // POST /verify-passport
// // → Verifies a passport image by reading the MRZ and validating it.
// // ---------------------------------------------------------------------------
// // Use in-memory storage for uploaded files
// const upload = multer({ storage: multer.memoryStorage() });


// // PLACE IN ENVIRONMENT VARIABLE
// const CLOUD_FUNCTION_URL =
//   "https://europe-west1-oursay.cloudfunctions.net/scanPassport";

// // PLACE IN ENVIRONMENT VARIABLE
// const IDENTITY_SALT = "SUPPER_SECRET_REAL_SECRET_SALT";


// app.post("/verify-passport", upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     const userId = req.body.userId;

//     if (!userId) {
//       return res.status(400).json({ error: "Missing userId" });
//     }

//     // 1. Build multipart form-data to send to Cloud Function
//     const form = new FormData();
//     form.append("file", req.file.buffer, {
//       filename: req.file.originalname || "passport.jpg",
//       contentType: req.file.mimetype || "image/jpeg",
//     });

//     // 2. Call the Cloud Function
//     const cfResponse = await axios.post(CLOUD_FUNCTION_URL, form, {
//       headers: form.getHeaders(),
//       timeout: 60000,
//     });

//     const { mrz_lines } = cfResponse.data;

//     if (!mrz_lines || mrz_lines.length < 2) {
//       return res.status(400).json({
//         error: "MRZ not returned from OCR service",
//         raw: cfResponse.data,
//       });
//     }

//     // 3. Parse MRZ
//     const mrzResult = parse(mrz_lines);

//     if (!mrzResult.valid) {
//       return res.status(400).json({
//         error: "MRZ validation failed",
//         details: mrzResult.errors,
//         mrz_lines,
//       });
//     }

//     const f = mrzResult.fields;

//     // 4. Build identity string you consider "unique enough"
//     const identityStringParts = {
//       documentNumber: f.documentNumber || null,
//       issuingCountry: f.issuingCountry || null,
//       dateOfBirth: null,          // will fill in later
//       expiry: f.expirationDate || null,
//       nationality: null           // will fill in later
//     };

//     const identityString = JSON.stringify(identityStringParts);

//     // 5. Hash it so you never store raw MRZ
//     const identityHash = crypto
//       .createHash("sha256")
//       .update(identityString + IDENTITY_SALT)
//       .digest("hex");

//     // 6. Store hash in the database
//     await pool.query(
//       "UPDATE users SET identity_token = $1 WHERE id = $2",
//       [identityHash, userId]
//     );

//     console.log("User verified:", userId);

//     // 7. Respond to the mobile app
//     return res.status(200).json({
//       verified: true,
//       identity_token: identityHash,
//     });
//   } catch (err) {
//     console.error(
//       "Verification error:",
//       err.response?.data || err.message || err
//     );
//     return res.status(500).json({
//       error: "Verification failed",
//       detail: err.response?.data || err.message || "Unknown error",
//     });
//   }
// });

// //---------------------------------------------------------------------------
// //              AUTH ROUTES
// //
// //        Handles: user signup and login.
// //---------------------------------------------------------------------------

// //---------------------------------------------------------------------------
// // --- simple password hashing helper 
// //---------------------------------------------------------------------------
// const PASSWORD_SALT = process.env.PASSWORD_SALT || 'dev_salt_change_me';

// function hashPassword(password) {
//   return crypto
//     .createHash('sha256')
//     .update(password + PASSWORD_SALT)
//     .digest('hex');
// }

// // ---------------------------------------------------------------------------
// // POST /signup
// // Creates a new user with hashed password.
// // ---------------------------------------------------------------------------
// app.post('/signup', async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({ error: 'Username and password are required' });
//     }

//     const password_hash = hashPassword(password);

//     const result = await pool.query(
//       'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at',
//       [username, password_hash]
//     );

//     return res.status(201).json({
//       message: 'Signup successful',
//       user: result.rows[0]
//     });
//   } catch (err) {
//     // handle duplicate username nicely
//     if (err.code === '23505') {
//       return res.status(409).json({ error: 'Username already taken' });
//     }
//     console.error('Error in /signup:', err);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // ---------------------------------------------------------------------------
// // POST /login
// // returns user info if successful (no JWT yet)
// // ---------------------------------------------------------------------------
// app.post('/login', async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({ error: 'Username and password are required' });
//     }

//     const result = await pool.query(
//       'SELECT id, username, password_hash , identity_token FROM users WHERE username = $1',
//       [username]
//     );

//     if (result.rowCount === 0) {
//       return res.status(401).json({ error: 'Invalid username or password' });
//     }

//     const user = result.rows[0];
//     const hashedInput = hashPassword(password);

//     if (hashedInput !== user.password_hash) {
//       return res.status(401).json({ error: 'Invalid password' });
//     }

//     // For now: just return user info (no JWT yet)
//     return res.json({ 
//       message: 'Login successful',
//       user: {
//         id: user.id,
//         username: user.username,
//         identity_token: user.identity_token
//       }
//     });
//   } catch (err) {
//     console.error('Error in /login:', err);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // ---------------------------------------------------------------------------
// // DISCUSSION SYSTEM ROUTES
// // Handles: listing discussions, viewing a single discussion,
// // posting comments, and upvote/downvote logic.
// // ---------------------------------------------------------------------------

// // GET all discussion categories
// app.get("/discussion-categories", async (req, res) => {
//   try {
//     const result = await pool.query(
//       "SELECT id, title, description FROM discussion_categories ORDER BY id ASC"
//     );
//     res.json(result.rows);
//   } catch (err) {
//     console.error("Error loading discussion categories:", err);
//     res.status(500).json({ error: "Failed to load categories" });
//   }
// });


// // Get disscusions by the category id
// app.get('/discussions/by-category/:categoryId', async (req, res) => {
//   const { categoryId } = req.params;

//   try {
//     const result = await pool.query(`
//       SELECT
//         d.id,
//         d.title,
//         d.body,
//         COALESCE(v.upvotes, 0) AS upvotes,
//         COALESCE(v.downvotes, 0) AS downvotes,
//         COALESCE(c.comment_count, 0) AS comment_count
//       FROM discussions d
//       LEFT JOIN (
//         SELECT 
//           discussion_id,
//           SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END) AS upvotes,
//           SUM(CASE WHEN value = -1 THEN 1 ELSE 0 END) AS downvotes
//         FROM discussion_votes
//         GROUP BY discussion_id
//       ) v ON v.discussion_id = d.id
//       LEFT JOIN (
//         SELECT discussion_id, COUNT(*) AS comment_count
//         FROM comments
//         GROUP BY discussion_id
//       ) c ON c.discussion_id = d.id
//       WHERE d.category_id = $1
//       ORDER BY d.created_at DESC
//     `, [categoryId]);

//     res.json(result.rows);

//   } catch (err) {
//     console.error("Error in GET /discussions/by-category:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // ---------------------------------------------------------------------------
// // → Returns ONE discussion including all comments + commenter usernames.
// // ---------------------------------------------------------------------------
// app.get('/discussions/:id', async (req, res) => {
//   try {
//     const { id } = req.params;

//     // 1. Fetch selected discussion
//     const discussionResult = await pool.query(
//       `SELECT id, title, body, created_at
//        FROM discussions
//        WHERE id = $1`,
//       [id]
//     );

//     if (discussionResult.rowCount === 0) {
//       return res.status(404).json({ error: 'Discussion not found' });
//     }

//     // 2. Fetch all comments for this discussion (with username)
//     const commentsResult = await pool.query(
//       `SELECT 
//           c.id,
//           c.body,
//           c.created_at,
//           u.username
//        FROM comments c
//        LEFT JOIN users u ON u.id = c.user_id
//        WHERE c.discussion_id = $1
//        ORDER BY c.created_at DESC`,
//       [id]
//     );

//     // 3. Return discussion + comments
//     res.json({
//       ...discussionResult.rows[0],
//       comments: commentsResult.rows
//     });

//   } catch (err) {
//     console.error("Error in GET /discussions/:id:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });


// // ---------------------------------------------------------------------------
// // GET /discussions
// // → Returns ALL discussions with upvote/downvote totals + comment counts.
// // This is used for the "Discussions List" page.
// // ---------------------------------------------------------------------------
// app.get('/trendingdiscussions', async (req, res) => {
//   try {
//     const result = await pool.query(`
//         SELECT
//         d.id,
//         d.title,
//         d.body,

//         -- Correct vote totals
//         COALESCE(v.upvotes, 0) AS upvotes,
//         COALESCE(v.downvotes, 0) AS downvotes,

//         -- Correct comment count
//         COALESCE(c.comment_count, 0) AS comment_count

//         FROM discussions d

//         LEFT JOIN (
//         SELECT
//             discussion_id,
//             SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END) AS upvotes,
//             SUM(CASE WHEN value = -1 THEN 1 ELSE 0 END) AS downvotes
//         FROM discussion_votes
//         GROUP BY discussion_id
//         ) v ON v.discussion_id = d.id

//         LEFT JOIN (
//         SELECT
//             discussion_id,
//             COUNT(*) AS comment_count
//         FROM comments
//         GROUP BY discussion_id
//         ) c ON c.discussion_id = d.id

//         ORDER BY upvotes DESC
//         LIMIT 2
//     `);

//     res.json(result.rows);

//   } catch (err) {
//     console.error('Error in GET /discussions:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


// // ---------------------------------------------------------------------------
// // POST /discussions/:id/comments
// // → Adds a comment to a discussion.
// // TEMP: userId is passed manually until login setup is complete.
// // ---------------------------------------------------------------------------
// app.post('/discussions/:id/comments', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { body, userId } = req.body;

//     if (!body || body.trim() === '') {
//       return res.status(400).json({ error: 'Comment body is required' });
//     }

//     // Default commenter to user 1 if not provided (temporary for FYP)
//     const user = userId || 1;

//     const result = await pool.query(
//       `INSERT INTO comments (discussion_id, user_id, body)
//        VALUES ($1, $2, $3)
//        RETURNING id, body, created_at`,
//       [id, user, body.trim()]
//     );

//     res.status(201).json(result.rows[0]);

//   } catch (err) {
//     console.error('Error posting comment:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


// // ---------------------------------------------------------------------------
// // → Add or update a user's upvote/downvote.
// // Ensures: one vote per user per discussion.
// // ---------------------------------------------------------------------------
// app.post('/discussions/:id/vote', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { userId, direction } = req.body;

//     if (!userId) {
//       return res.status(400).json({ error: 'userId is required (temporary)' });
//     }

//     if (!['up', 'down'].includes(direction)) {
//       return res.status(400).json({ error: 'direction must be "up" or "down"' });
//     }

//     const value = direction === 'up' ? 1 : -1;

//     // UPSERT vote - ensures user can only vote once
//     await pool.query(
//       `INSERT INTO discussion_votes (discussion_id, user_id, value)
//        VALUES ($1, $2, $3)
//        ON CONFLICT (discussion_id, user_id)
//        DO UPDATE SET value = EXCLUDED.value`,
//       [id, userId, value]
//     );

//     // Return updated total vote counts
//     const counts = await pool.query(
//       `SELECT
//          COALESCE(SUM(CASE WHEN value = 1 THEN 1 END), 0) AS upvotes,
//          COALESCE(SUM(CASE WHEN value = -1 THEN 1 END), 0) AS downvotes
//        FROM discussion_votes
//        WHERE discussion_id = $1`,
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

// // ============================================================================
// // POLL SYSTEM ROUTES
// // Handles:
// //   • Weekly public poll (featured poll)
// //   • Normal poll topics
// //   • Poll questions inside each topic
// //   • Voting (yes/no)
// //   • Updating topic progress (0 = not started, 1 = in progress, 2 = completed)
// // ============================================================================

// // ============================================================================
// // GET /?userId=1
// // Returns ONLY the weekly poll topic.
// // Includes:
// //   • total_polls      = polls under weekly topic
// //   • completed_polls  = how many polls this user answered
// // ============================================================================

// app.get("/weekly-poll", async (req, res) => {
//   const userId = parseInt(req.query.userId);

//   try {
//     const weekly = await pool.query(
//       `
//       SELECT 
//         pt.id,
//         pt.title,
//         pt.description,

//         -- Total number of polls in the weekly topic
//         (SELECT COUNT(*) FROM polls WHERE topic_id = pt.id) AS total_polls,

//         -- Completed polls from poll_topic_progress table
//         COALESCE(pp.completed_polls, 0) AS completed_polls

//       FROM poll_topics pt

//       LEFT JOIN poll_topic_progress pp
//         ON pp.topic_id = pt.id AND pp.user_id = $1

//       WHERE pt.is_weekly = true
//       LIMIT 1;
//       `,
//       [userId]
//     );

//     res.json(weekly.rows[0] || null);
//   } catch (err) {
//     console.error("Error fetching weekly poll:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

  


// // ============================================================================
// // GET /poll-topics?userId=1
// // Returns ALL *normal* (non-weekly) poll topics.
// // Includes:
// //   • total_polls
// //   • completed_polls
// //   • status (0/1/2)
// // ============================================================================
// app.get("/poll-topics", async (req, res) => {
//   const userId = parseInt(req.query.userId) || 0;

//   try {
//     const topics = await pool.query(
//       `
//       SELECT 
//         pt.id,
//         pt.title,
//         pt.description,
//         COALESCE(pc.total_polls, 0) AS total_polls,
//         COALESCE(up.completed_polls, 0) AS completed_polls,
//         CASE
//           WHEN COALESCE(up.completed_polls, 0) = 0 THEN 0
//           WHEN COALESCE(up.completed_polls, 0) < COALESCE(pc.total_polls, 0) THEN 1
//           ELSE 2
//         END AS status
//       FROM poll_topics pt
//       LEFT JOIN (
//         SELECT topic_id, COUNT(*) AS total_polls
//         FROM polls
//         GROUP BY topic_id
//       ) pc ON pc.topic_id = pt.id
//       LEFT JOIN (
//         SELECT p.topic_id, COUNT(*) AS completed_polls
//         FROM poll_votes v
//         JOIN polls p ON p.id = v.poll_id
//         WHERE v.user_id = $1
//         GROUP BY p.topic_id
//       ) up ON up.topic_id = pt.id
//       WHERE pt.is_weekly = false   -- ❗ weekly excluded here
//       ORDER BY pt.id;
//       `,
//       [userId]
//     );

//     res.json(topics.rows);
//   } catch (err) {
//     console.error("Error fetching poll topics:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });



// // ============================================================================
// // GET /polls-by-topic/:topicId
// // Returns all poll questions under a given topic.
// // ============================================================================
// app.get("/polls-by-topic/:topicId", async (req, res) => {
//   const topicId = parseInt(req.params.topicId);

//   try {
//     const result = await pool.query(
//       `
//       SELECT id, title, description
//       FROM polls
//       WHERE topic_id = $1
//       ORDER BY id;
//       `,
//       [topicId]
//     );

//     res.json(result.rows);
//   } catch (err) {
//     console.error("Error fetching polls:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });



// // ============================================================================
// // POST /polls/:id/vote
// // Casts or updates a user's vote for a poll.
// //   • Exactly one vote per user per poll (UPSERT)
// //   • choice must be "yes" or "no"
// // ============================================================================
// app.post("/polls/:id/vote", async (req, res) => {
//   const pollId = parseInt(req.params.id);
//   const { userId, choice } = req.body;

//   if (!userId) {
//     return res.status(400).json({ error: "userId is required" });
//   }
//   if (!["yes", "no"].includes(choice)) {
//     return res.status(400).json({ error: "choice must be 'yes' or 'no'" });
//   }

//   try {
//     await pool.query(
//       `
//       INSERT INTO poll_votes (poll_id, user_id, choice)
//       VALUES ($1, $2, $3)
//       ON CONFLICT (poll_id, user_id)
//       DO UPDATE SET choice = EXCLUDED.choice;
//       `,
//       [pollId, userId, choice]
//     );

//     res.json({ success: true });
//   } catch (err) {
//     console.error("Error saving vote:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });
// // ============================================================================
// // GET /poll-topic-progress/:topicId?userId=1
// // Returns current progress for a user on a topic
// // ============================================================================
// app.get("/poll-topic-progress/:topicId", async (req, res) => {
//   const topicId = parseInt(req.params.topicId);
//   const userId = parseInt(req.query.userId);

//   if (!userId || !topicId) {
//     return res.status(400).json({ error: "Missing userId or topicId" });
//   }

//   try {
//     // First try to read a stored record
//     const progress = await pool.query(
//       `SELECT status, completed_polls 
//        FROM poll_topic_progress
//        WHERE user_id = $1 AND topic_id = $2`,
//       [userId, topicId]
//     );

//     // Count total polls ALWAYS
//     const totalRes = await pool.query(
//       `SELECT COUNT(*) AS total FROM polls WHERE topic_id = $1`,
//       [topicId]
//     );
//     const total_polls = parseInt(totalRes.rows[0].total);

//     // If no stored row, return default
//     if (progress.rows.length === 0) {
//       return res.json({
//         status: 0,
//         completed_polls: 0,
//         total_polls,
//       });
//     }

//     // Row exists → use REAL stored values
//     const row = progress.rows[0];

//     return res.json({
//       status: row.status,
//       completed_polls: row.completed_polls,
//       total_polls
//     });

//   } catch (err) {
//     console.error("Error fetching topic progress:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });
// // ============================================================================
// // POST /poll-topic-progress/:topicId/reset
// // Clears all votes and resets progress to 0
// // ============================================================================
// app.post("/poll-topic-progress/:topicId/reset", async (req, res) => {
//   const topicId = parseInt(req.params.topicId);
//   const userId = parseInt(req.body.userId);

//   if (!topicId || !userId) {
//     return res.status(400).json({ error: "Missing userId or topicId" });
//   }

//   try {
//     // Delete all the user's votes for this topic
//     await pool.query(
//       `
//       DELETE FROM poll_votes
//       WHERE user_id = $1
//       AND poll_id IN (SELECT id FROM polls WHERE topic_id = $2)
//       `,
//       [userId, topicId]
//     );

//     // Reset progress entry
//     await pool.query(
//       `
//       INSERT INTO poll_topic_progress (user_id, topic_id, status, completed_polls)
//       VALUES ($1, $2, 0, 0)
//       ON CONFLICT (user_id, topic_id)
//       DO UPDATE SET 
//         status = 0,
//         completed_polls = 0,
//         updated_at = NOW();
//       `,
//       [userId, topicId]
//     );

//     res.json({ success: true });
//   } catch (err) {
//     console.error("Error resetting progress:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // ============================================================================
// // POST /poll-topic-progress/:topicId/update
// // Updates a user's progress on a poll topic.
// // Calculates completed polls and status (0/1/2).
// // ============================================================================


// app.post("/poll-topic-progress/:topicId/update", async (req, res) => {
//   const userId = parseInt(req.body.userId);
//   const topicId = parseInt(req.params.topicId);

//   if (!userId || !topicId) {
//     return res.status(400).json({ error: "Missing userId or topicId" });
//   }

//   try {
//     // Count totals
//     const totalRes = await pool.query(
//       `SELECT COUNT(*) AS total FROM polls WHERE topic_id = $1`,
//       [topicId]
//     );
//     const totalPolls = parseInt(totalRes.rows[0].total);

//     // Count completed by user
//     const completedRes = await pool.query(
//       `SELECT COUNT(*) AS completed
//        FROM poll_votes
//        WHERE user_id = $1
//        AND poll_id IN (SELECT id FROM polls WHERE topic_id = $2);`,
//       [userId, topicId]
//     );
//     const completedPolls = parseInt(completedRes.rows[0].completed);

//     // Determine status
//     let status = 0;
//     if (completedPolls === 0) status = 0;
//     else if (completedPolls < totalPolls) status = 1;
//     else status = 2;

//     // Save EVERYTHING (status + completed)
//     await pool.query(
//       `INSERT INTO poll_topic_progress (user_id, topic_id, status, completed_polls)
//        VALUES ($1, $2, $3, $4)
//        ON CONFLICT (user_id, topic_id)
//        DO UPDATE SET 
//           status = EXCLUDED.status,
//           completed_polls = EXCLUDED.completed_polls,
//           updated_at = NOW();`,
//       [userId, topicId, status, completedPolls]
//     );

//     res.json({
//       topicId,
//       userId,
//       status,
//       completed_polls: completedPolls,
//       total_polls: totalPolls
//     });

//   } catch (err) {
//     console.error("Error updating topic progress:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // ============================================================================
// // START SERVER
// // ============================================================================
// app.listen(3000, () => console.log("Backend running on port 3000"));


const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const verifyRoutes = require('./routes/verify.routes');
const discussionRoutes = require('./routes/discussion.routes');
const pollRoutes = require('./routes/poll.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/verify', verifyRoutes);
app.use('/discussions', discussionRoutes);
app.use('/poll', pollRoutes);

app.listen(3000, () => {
  console.log('Backend running on port 3000');
});