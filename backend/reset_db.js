const fs = require('fs');
const { Client } = require('pg');

async function main() {
  const admin = new Client({
    host: '127.0.0.1',
    port: 5433,
    user: 'postgres',
    password: '',
    database: 'postgres',
  });

  await admin.connect();
  const exists = await admin.query("SELECT 1 FROM pg_database WHERE datname = 'food_rescue'");
  if (exists.rowCount === 0) {
    await admin.query("CREATE DATABASE food_rescue");
  }
  await admin.end();

  const appDb = new Client({
    host: '127.0.0.1',
    port: 5433,
    user: 'postgres',
    password: '',
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
