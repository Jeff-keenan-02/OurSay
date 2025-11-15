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
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const result = await pool.query(
    "SELECT id, username, password_hash FROM users WHERE username=$1",
    [username]
  );

  if (result.rowCount === 0) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const user = result.rows[0];
  const hashedInput = hashPassword(password);

  if (hashedInput !== user.password_hash) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  res.json({ message: "Login successful", user });
});

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

app.listen(3000, () => console.log('Backend running on port 3000'));

