require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to Postgres
const pool = new Pool({
  host: 'localhost',
  user: 'oursay',
  password: 'RILEY2015',
  database: 'oursaydb',
  port: 5431
});

// Test route
app.get('/polls', async (req, res) => {
  const result = await pool.query('SELECT * FROM polls;');
  res.json(result.rows);
});

app.listen(3000, () => console.log("Backend running on port 3000"));