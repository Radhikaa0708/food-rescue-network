const fs = require('fs');
const { Pool } = require('pg');

async function main() {
  const admin = new Pool({
    host: '127.0.0.1',
    port: 5433,
    user: 'postgres',
    password: '',
    database: 'postgres',
  });

  const dbExists = await admin.query("SELECT 1 FROM pg_database WHERE datname = 'food_rescue'");
  if (dbExists.rowCount === 0) {
    await admin.query("CREATE DATABASE food_rescue");
  }
  await admin.end();

  const appPool = new Pool({
    host: '127.0.0.1',
    port: 5433,
    user: 'postgres',
    password: '',
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
