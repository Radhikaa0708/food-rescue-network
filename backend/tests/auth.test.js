const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const { checkConnection, query } = require("../src/config/database");

let dbReady = false;
let emailCounter = 0;

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-only-secret";
  try {
    dbReady = await checkConnection();
  } catch (error) {
    dbReady = false;
  }
});

function uniqueEmail() {
  emailCounter += 1;
  return `auth-test-${Date.now()}-${emailCounter}@example.com`;
}

describe("Authentication API", () => {
  test("rejects invalid registration data", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "not-an-email",
      password: "short",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("requires authentication for the current user", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  test("registers, logs in, and returns the current user", async () => {
    if (!dbReady) return;
    const email = uniqueEmail();

    const registered = await request(app).post("/api/auth/register").send({
      name: "Auth Tester",
      email,
      password: "secure-password",
    });

    expect(registered.status).toBe(201);
    expect(registered.body.data.user.email).toBe(email);
    expect(registered.body.data.user.password_hash).toBeUndefined();
    expect(registered.body.data.token).toBeTruthy();

    const stored = await query("SELECT password_hash FROM users WHERE email = $1", [email]);
    expect(stored.rows[0].password_hash).not.toBe("secure-password");
    expect(stored.rows[0].password_hash).toMatch(/^\$2[aby]\$/);

    const login = await request(app).post("/api/auth/login").send({
      email: email.toUpperCase(),
      password: "secure-password",
    });
    expect(login.status).toBe(200);

    const me = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${login.body.data.token}`);
    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe(email);
  });

  test("rejects duplicate emails and invalid credentials", async () => {
    if (!dbReady) return;
    const email = uniqueEmail();
    const payload = { name: "Duplicate Tester", email, password: "secure-password" };

    await request(app).post("/api/auth/register").send(payload);
    const duplicate = await request(app).post("/api/auth/register").send(payload);
    expect(duplicate.status).toBe(409);

    const badPassword = await request(app).post("/api/auth/login").send({
      email,
      password: "wrong-password",
    });
    expect(badPassword.status).toBe(401);

    const unknownEmail = await request(app).post("/api/auth/login").send({
      email: uniqueEmail(),
      password: "wrong-password",
    });
    expect(unknownEmail.status).toBe(401);
  });

  test("rejects invalid and expired tokens", async () => {
    const invalid = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid-token");
    expect(invalid.status).toBe(401);

    const expired = jwt.sign({ sub: "1" }, process.env.JWT_SECRET, { expiresIn: -1 });
    const expiredResponse = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${expired}`);
    expect(expiredResponse.status).toBe(401);
  });

  test("logout returns success for the stateless token flow", async () => {
    const res = await request(app).post("/api/auth/logout");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});