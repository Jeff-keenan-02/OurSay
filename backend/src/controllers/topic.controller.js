const pool = require('../db/pool');

exports.getTopics = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, description
       FROM topics
       ORDER BY title`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching topics:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};