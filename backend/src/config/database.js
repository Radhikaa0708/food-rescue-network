const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err.message);
});

async function testConnection() {
  try {
    await pool.query("SELECT 1");
    console.log("Database connected successfully");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection,
};