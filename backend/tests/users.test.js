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

describe("Users API", () => {
  test("POST /api/users rejects an invalid role", async () => {
    const res = await request(app).post("/api/users").send({
      name: "Ravi",
      role: "driver",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("database connection is available for user tests", async () => {
    if (!dbReady) {
      console.warn("PostgreSQL is not reachable for user tests.");
    }
    expect(dbReady).toBe(true);
  });

  test("POST /api/users creates a volunteer", async () => {
    if (!dbReady) return;

    const res = await request(app).post("/api/users").send({
      name: "Ravi",
      role: "volunteer",
      organization: "Helping Hands",
      location: "Tirunelveli",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe("volunteer");
    expect(res.body.data.name).toBe("Ravi");
  });

  test("GET /api/users returns a collection", async () => {
    if (!dbReady) return;

    const res = await request(app).get("/api/users");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBe(res.body.data.length);
  });

  test("GET /api/users/:id returns 404 for a missing user", async () => {
    if (!dbReady) return;

    const res = await request(app).get("/api/users/999999");
    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe("User not found");
  });
});
