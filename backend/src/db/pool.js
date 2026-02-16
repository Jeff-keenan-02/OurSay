
{/* Local pool connection */}

// const { Pool } = require("pg");

// const pool = new Pool({
//   host: process.env.DB_HOST,
//   port: Number(process.env.DB_PORT),
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   ssl: process.env.NODE_ENV === "production"
//     ? { rejectUnauthorized: false }
//     : false,
// });

// module.exports = pool;


{/* Render pool connection */}

const { Pool } = require("pg");
const DATABASE_URL = "postgresql://user:uItWJuHWJph5BntZG9efoXhxoamPmpHh@dpg-d651ge6r433s73arvp70-a/oursaydb";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;