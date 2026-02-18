const crypto = require('crypto');
const pool = require('../db/pool');
const { generateToken } = require("../services/token.service");


// ---------------------------------------------------------------------------
// Password hashing helper
// ---------------------------------------------------------------------------
const PASSWORD_SALT = process.env.PASSWORD_SALT || 'dev_salt_change_me';

function hashPassword(password) {
  return crypto
    .createHash('sha256')
    .update(password + PASSWORD_SALT)
    .digest('hex');
}

// ---------------------------------------------------------------------------
// POST /signup
// ---------------------------------------------------------------------------
exports.signup = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const password_hash = hashPassword(password);

    const result = await pool.query(
      `
      INSERT INTO users (username, password_hash)
      VALUES ($1, $2)
      RETURNING id, username, verification_tier
      `,
      [username, password_hash]
    );

    const user = result.rows[0];

    // Generate token immediately
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
    const hashedInput = hashPassword(password);

    if (hashedInput !== user.password_hash) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }


    // Login returns token
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