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
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || "food_rescue",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "missing-local-password",
    timezone: "UTC",
  });
}

const pool = createPool();

async function query(text, params) {
  try {
    return await pool.query(text, params);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("PostgreSQL query failed:", error.message);
    }
    throw error;
  }
}

async function checkConnection() {
  try {
    await pool.query("SELECT 1 AS ok");
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("PostgreSQL connection failed:", error.message);
    }
    throw error;
  }
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
