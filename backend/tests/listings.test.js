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

function futureIso(hours = 4) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

function pastIso(hours = 2) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

describe("Health and root", () => {
  test("GET / keeps the original running message", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toBe("Food Rescue Backend is running!");
  });

  test("GET /api/health returns a healthy payload", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Food Rescue API is healthy");
    expect(["connected", "disconnected"]).toContain(res.body.data.database);
  });
});

describe("Listings API", () => {
  test("POST /api/listings rejects invalid request data", async () => {
    const res = await request(app).post("/api/listings").send({
      provider_name: "ABC Restaurant",
      food_type: "Rice",
      quantity: 10,
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toBeTruthy();
  });

  test("POST /api/listings rejects invalid latitude", async () => {
    const res = await request(app).post("/api/listings").send({
      provider_name: "ABC Restaurant",
      food_type: "Rice",
      quantity: 10,
      latitude: 120,
      longitude: 77.75,
      available_until: futureIso(),
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("GET /api/listings/:id rejects a non-numeric id", async () => {
    const res = await request(app).get("/api/listings/abc");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("database connection is available for listing tests", async () => {
    if (!dbReady) {
      console.warn(
        "PostgreSQL is not reachable. Set DB_* in .env, create database food_rescue, then run database/schema.sql."
      );
    }
    expect(dbReady).toBe(true);
  });

  test("POST /api/listings creates a listing", async () => {
    if (!dbReady) return;

    const res = await request(app).post("/api/listings").send({
      provider_name: "ABC Restaurant",
      food_type: "Cooked Rice",
      quantity: 25,
      description: "Fresh cooked rice",
      location: "Tirunelveli",
      latitude: 8.7139,
      longitude: 77.7567,
      available_until: futureIso(5),
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("available");
    expect(res.body.data.provider_name).toBe("ABC Restaurant");
  });

  test("GET /api/listings returns available listings", async () => {
    if (!dbReady) return;

    const res = await request(app).get("/api/listings?status=available");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBe(res.body.data.length);
    res.body.data.forEach((item) => {
      expect(item.status).toBe("available");
    });
  });

  test("GET /api/listings/:id returns a listing or 404", async () => {
    if (!dbReady) return;

    const created = await request(app).post("/api/listings").send({
      provider_name: "Lookup Cafe",
      food_type: "Idli",
      quantity: 12,
      location: "Tirunelveli",
      latitude: 8.7139,
      longitude: 77.7567,
      available_until: futureIso(),
    });

    const id = created.body.data.id;
    const res = await request(app).get(`/api/listings/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
  });

  test("GET /api/listings/:id returns 404 for a missing listing", async () => {
    if (!dbReady) return;

    const res = await request(app).get("/api/listings/999999");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toBe("Food listing not found");
  });

  test("PUT /api/listings/:id updates allowed fields", async () => {
    if (!dbReady) return;

    const created = await request(app).post("/api/listings").send({
      provider_name: "Update Hotel",
      food_type: "Sambar",
      quantity: 8,
      location: "Tirunelveli",
      available_until: futureIso(),
    });

    const id = created.body.data.id;
    const res = await request(app).put(`/api/listings/${id}`).send({
      quantity: 15,
      description: "Updated surplus sambar",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.quantity).toBe(15);
    expect(res.body.data.description).toBe("Updated surplus sambar");
    expect(res.body.data.id).toBe(id);
    expect(res.body.data.created_at).toBe(created.body.data.created_at);
  });

  test("PATCH /api/listings/:id/status validates and applies transitions", async () => {
    if (!dbReady) return;

    const created = await request(app).post("/api/listings").send({
      provider_name: "Status Hotel",
      food_type: "Bread",
      quantity: 5,
      available_until: futureIso(),
    });

    const id = created.body.data.id;

    const invalid = await request(app)
      .patch(`/api/listings/${id}/status`)
      .send({ status: "delivered" });
    expect(invalid.status).toBe(400);

    const cancelled = await request(app)
      .patch(`/api/listings/${id}/status`)
      .send({ status: "cancelled" });
    expect(cancelled.status).toBe(200);
    expect(cancelled.body.data.status).toBe("cancelled");
  });

  test("GET /api/listings/nearby returns distance_km within radius", async () => {
    if (!dbReady) return;

    await request(app).post("/api/listings").send({
      provider_name: "Nearby Kitchen",
      food_type: "Rice",
      quantity: 10,
      location: "Tirunelveli",
      latitude: 8.7139,
      longitude: 77.7567,
      available_until: futureIso(),
    });

    const res = await request(app).get("/api/listings/nearby").query({
      latitude: 8.7139,
      longitude: 77.7567,
      radius: 10,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach((item) => {
      expect(item.distance_km).toBeLessThanOrEqual(10);
    });
  });

  test("expired listings do not appear as available", async () => {
    if (!dbReady) return;

    const created = await request(app).post("/api/listings").send({
      provider_name: "Expired Stall",
      food_type: "Fruit Salad",
      quantity: 4,
      location: "Tirunelveli",
      latitude: 8.71,
      longitude: 77.75,
      available_until: pastIso(3),
    });

    const id = created.body.data.id;
    const list = await request(app).get("/api/listings?status=available");
    const found = list.body.data.find((item) => item.id === id);
    expect(found).toBeUndefined();
  });
});
