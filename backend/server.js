const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

let poolConfig;

// Render / production: use DATABASE_URL
if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction
      ? { rejectUnauthorized: false }
      : false,
  };
} else {
  // Local development: use individual DB_* variables
  poolConfig = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: false,
  };
}

const pool = new Pool(poolConfig);

async function checkConnection() {
  try {
    await pool.query("SELECT 1");
    console.log("Database connection successful");
    return true;
  } catch (error) {
    console.error("Database connection failed");
    console.error("Reason:", error.message);
    throw error;
  }
}

module.exports = {
  pool,
  checkConnection,
};