// const { Pool } = require('pg');

// const pool = new Pool({
//   host: 'localhost',
//   user: 'oursay',
//   password: 'RILEY2015',
//   database: 'oursaydb',
//   port: 5431,
// });

// module.exports = pool;
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5431,
  user: process.env.DB_USER || "oursay",
  password: process.env.DB_PASSWORD || "RILEY2015",
  database: process.env.DB_NAME || "oursaydb",
});

module.exports = pool;