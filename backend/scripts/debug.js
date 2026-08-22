require('dotenv').config();
// Ensure DB env vars are set before loading the app (the pool is created at import-time)
process.env.DB_HOST = process.env.DB_HOST || '127.0.0.1';
process.env.DB_PORT = process.env.DB_PORT || '5433';
process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || '';
process.env.DB_NAME = process.env.DB_NAME || 'food_rescue';

const request = require('supertest');
const app = require('../src/app');

async function run() {
  try {
    console.log('Creating volunteer...');
    const volRes = await request(app).post('/api/users').send({
      name: 'Debug Volunteer',
      role: 'volunteer',
      organization: 'Debug Org',
      location: 'Nowhere',
    });
    console.log('VOL', volRes.status, volRes.body);

    console.log('Creating listing...');
    const listRes = await request(app).post('/api/listings').send({
      provider_name: 'Debug Provider',
      food_type: 'Debug Food',
      quantity: 5,
      location: 'Nowhere',
      latitude: 8.7139,
      longitude: 77.7567,
      available_until: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    });
    console.log('LIST', listRes.status, listRes.body);

    const id = listRes.body.data.id;

    console.log('Attempting claim...');
    const claimRes = await request(app)
      .post(`/api/listings/${id}/claim`)
      .send({ volunteer_id: volRes.body.data.id });
    console.log('CLAIM', claimRes.status, claimRes.body);

    console.log('Attempting cancel status...');
    const cancelRes = await request(app)
      .patch(`/api/listings/${id}/status`)
      .send({ status: 'cancelled' });
    console.log('CANCEL', cancelRes.status, cancelRes.body);
  } catch (err) {
    console.error('ERROR', err);
  }
}

run();
