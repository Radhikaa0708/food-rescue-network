(async () => {
  const base = 'http://localhost:5000';
  const headers = { 'Content-Type': 'application/json' };
  try {
    console.log('CREATE USER');
    let res = await fetch(base + '/api/users', { method: 'POST', headers, body: JSON.stringify({ name: 'Smoke Volunteer', role: 'volunteer', organization: 'Smoke Org', location: 'Nowhere' }) });
    let body = await res.json(); console.log('status', res.status); console.log(JSON.stringify(body, null, 2));

    const volunteerId = body.data.id;

    console.log('\nCREATE LISTING');
    res = await fetch(base + '/api/listings', { method: 'POST', headers, body: JSON.stringify({ provider_name: 'Smoke Kitchen', food_type: 'Soup', quantity: 10, location: 'Nowhere', latitude: 8.7139, longitude: 77.7567, available_until: new Date(Date.now()+4*3600*1000).toISOString() }) });
    body = await res.json(); console.log('status', res.status); console.log(JSON.stringify(body, null, 2));

    const listingId = body.data.id;

    console.log('\nCLAIM LISTING');
    res = await fetch(`${base}/api/listings/${listingId}/claim`, { method: 'POST', headers, body: JSON.stringify({ volunteer_id: volunteerId }) });
    body = await res.json(); console.log('status', res.status); console.log(JSON.stringify(body, null, 2));

    console.log('\nGET LISTINGS?status=available');
    res = await fetch(base + '/api/listings?status=available'); body = await res.json(); console.log('status', res.status); console.log(JSON.stringify({ count: body.count, first: body.data[0] }, null, 2));

    console.log('\nGET CLAIMS');
    res = await fetch(base + '/api/claims'); body = await res.json(); console.log('status', res.status); console.log(JSON.stringify({ count: body.count, recent: body.data.slice(0,3) }, null, 2));

    console.log('\nNEARBY');
    res = await fetch(base + '/api/listings/nearby?latitude=8.7139&longitude=77.7567&radius=10'); body = await res.json(); console.log('status', res.status); console.log(JSON.stringify({ count: body.count, items: body.data.slice(0,3) }, null, 2));

  } catch (err) {
    console.error('ERROR', err.message);
  }
})();
