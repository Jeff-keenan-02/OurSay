const bcrypt = require('bcrypt');
const pool = require('../db/pool');
const { generateToken } = require("../services/jwt.service");

const SALT_ROUNDS = 12; //12 is a good balance.

// ---------------------------------------------------------------------------
// POST /signup
// ---------------------------------------------------------------------------
exports.signup = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Hash password with bcrypt (includes per-user salt automatically)
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await pool.query(
      `
      INSERT INTO users (username, password_hash)
      VALUES ($1, $2)
      RETURNING id, username, verification_tier
      `,
      [username, password_hash]
    );

    const user = result.rows[0];

    const token = generateToken({
      userId: user.id
    });

    return res.status(201).json({
      message: "Signup successful",
      token,
      user
    });

  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Username already taken' });
    }

    console.error('Error in signup:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ---------------------------------------------------------------------------
// POST /login
// ---------------------------------------------------------------------------
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await pool.query(
      `
      SELECT id, username, password_hash, verification_tier
      FROM users
      WHERE username = $1
      `,
      [username]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = result.rows[0];

    // Secure password comparison
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = generateToken({
      userId: user.id
    });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        verification_tier: user.verification_tier
      }
    });

  } catch (err) {
    console.error('Error in login:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};