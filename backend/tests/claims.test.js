const request = require("supertest");
const app = require("../src/app");
const { checkConnection } = require("../src/config/database");

let dbReady = false;

beforeAll(async () => {
  try {
    dbReady = await checkConnection();
  } catch (error) {
    dbReady = false;
  }
});

function futureIso() {
  return new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
}

function pastIso() {
  return new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
}

async function createVolunteer() {
  const res = await request(app).post("/api/auth/register").send({
    name: "Claim Tester",
    email: `claim-${Date.now()}-${Math.random()}@example.com`,
    password: "secure-password",
  });
  return { user: res.body.data.user, token: res.body.data.token };
}

async function createListing() {
  const res = await request(app).post("/api/listings").send({
    provider_name: "Claim Restaurant",
    food_type: "Biryani",
    quantity: 20,
    location: "Tirunelveli",
    latitude: 8.7139,
    longitude: 77.7567,
    available_until: futureIso(),
  });
  return res.body.data;
}

describe("Claims API", () => {
  test("rejects an unauthenticated claim", async () => {
    const res = await request(app).post("/api/listings/1/claim");
    expect(res.status).toBe(401);
  });

  test("database connection is available for claim tests", async () => {
    if (!dbReady) {
      console.warn("PostgreSQL is not reachable for claim tests.");
    }
    expect(dbReady).toBe(true);
  });

  test("POST /api/listings/:id/claim creates a claim", async () => {
    if (!dbReady) return;

    const volunteer = await createVolunteer();
    const listing = await createListing();

    const res = await request(app)
      .post(`/api/listings/${listing.id}/claim`)
      .set("Authorization", `Bearer ${volunteer.token}`);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.claim.status).toBe("claimed");
    expect(res.body.data.listing.status).toBe("claimed");
    expect(res.body.data.listing.claimed_by).toBe(volunteer.id);
  });

  test("prevents double claiming the same listing", async () => {
    if (!dbReady) return;

    const first = await createVolunteer();
    const second = await createVolunteer();
    const listing = await createListing();

    const claimOne = await request(app)
      .post(`/api/listings/${listing.id}/claim`)
      .set("Authorization", `Bearer ${first.token}`);
    expect(claimOne.status).toBe(201);

    const claimTwo = await request(app)
      .post(`/api/listings/${listing.id}/claim`)
      .set("Authorization", `Bearer ${second.token}`);

    expect(claimTwo.status).toBe(409);
    expect(claimTwo.body.success).toBe(false);
  });

  test("does not allow claiming expired food", async () => {
    if (!dbReady) return;

    const volunteer = await createVolunteer();
    const expired = await request(app).post("/api/listings").send({
      provider_name: "Late Kitchen",
      food_type: "Curry",
      quantity: 6,
      available_until: pastIso(),
    });

    const res = await request(app)
      .post(`/api/listings/${expired.body.data.id}/claim`)
      .set("Authorization", `Bearer ${volunteer.token}`);

    expect(res.status).toBe(409);
  });

  test("GET /api/claims and PATCH /api/claims/:id/status", async () => {
    if (!dbReady) return;

    const volunteer = await createVolunteer();
    const listing = await createListing();
    const claimed = await request(app)
      .post(`/api/listings/${listing.id}/claim`)
      .set("Authorization", `Bearer ${volunteer.token}`);

    const claimId = claimed.body.data.claim.id;

    const list = await request(app).get("/api/claims");
    expect(list.status).toBe(200);
    expect(list.body.count).toBeGreaterThan(0);

    const one = await request(app).get(`/api/claims/${claimId}`);
    expect(one.status).toBe(200);
    expect(one.body.data.id).toBe(claimId);

    const collected = await request(app)
      .patch(`/api/claims/${claimId}/status`)
      .send({ status: "collected" });

    expect(collected.status).toBe(200);
    expect(collected.body.data.status).toBe("collected");
    expect(collected.body.data.collected_at).toBeTruthy();
  });
});
