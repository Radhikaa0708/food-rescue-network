const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config();

const connection = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'missing-local-password',
};

async function main() {
  const admin = new Client({
    ...connection,
    database: 'postgres',
  });

  await admin.connect();
  const exists = await admin.query("SELECT 1 FROM pg_database WHERE datname = 'food_rescue'");
  if (exists.rowCount === 0) {
    await admin.query("CREATE DATABASE food_rescue");
  }
  await admin.end();

  const appDb = new Client({
    ...connection,
    database: 'food_rescue',
  });

  await appDb.connect();
  const schema = fs.readFileSync('./database/schema.sql', 'utf8');
  await appDb.query(schema);
  await appDb.end();

  console.log('schema reset okay');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
