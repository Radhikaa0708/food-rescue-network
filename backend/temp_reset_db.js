const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

const connection = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'missing-local-password',
};

async function main() {
  const admin = new Pool({
    ...connection,
    database: 'postgres',
  });

  const dbExists = await admin.query("SELECT 1 FROM pg_database WHERE datname = 'food_rescue'");
  if (dbExists.rowCount === 0) {
    await admin.query("CREATE DATABASE food_rescue");
  }
  await admin.end();

  const appPool = new Pool({
    ...connection,
    database: 'food_rescue',
  });

  const schema = fs.readFileSync('./database/schema.sql', 'utf8');
  await appPool.query(schema);
  await appPool.end();

  console.log('schema reset okay');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
