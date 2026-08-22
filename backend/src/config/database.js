const { Pool } = require("pg");

function getConnectionConfig() {
  if (process.env.DATABASE_URL) {
    const useSsl = process.env.NODE_ENV === "production" || process.env.DB_SSL === "true";
    const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false";

    return {
      mode: "DATABASE_URL",
      databaseUrlPresent: true,
      connectionString: process.env.DATABASE_URL,
      ssl: useSsl ? { rejectUnauthorized } : false,
      timezone: "UTC",
    };
  }

  return {
    mode: "DB_* configuration",
    databaseUrlPresent: false,
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || "food_rescue",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "missing-local-password",
    timezone: "UTC",
  };
}

function createPool() {
  const { mode, databaseUrlPresent, ...poolConfig } = getConnectionConfig();
  return new Pool(poolConfig);
}

const pool = createPool();
const connectionConfig = getConnectionConfig();

function logConnectionFailure(error) {
  console.error("Database connection failed");
  console.error(`Database configuration: ${connectionConfig.mode}`);
  console.error(`DATABASE_URL present: ${connectionConfig.databaseUrlPresent}`);
  console.error(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.error(`Reason: ${error.message}`);
}

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
    logConnectionFailure(error);
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
  getConnectionConfig,
};
