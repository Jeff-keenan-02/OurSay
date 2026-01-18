const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'oursay',
  password: 'RILEY2015',
  database: 'oursaydb',
  port: 5431,
});

module.exports = pool;