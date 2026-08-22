const { Pool } = require("pg");

function createPool() {
  if (process.env.DATABASE_URL) {
    const useSsl =
      process.env.NODE_ENV === "production" ||
      process.env.DB_SSL === "true";

    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      timezone: "UTC",
    });
  }

  return new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    timezone: "UTC",
  });
}

const pool = createPool();

async function query(text, params) {
  return pool.query(text, params);
}

async function checkConnection() {
  await pool.query("SELECT 1 AS ok");
  return true;
}

async function closePool() {
  await pool.end();
}

module.exports = {
  pool,
  query,
  checkConnection,
  closePool,
};
