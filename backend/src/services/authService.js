const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { query } = require("../config/database");
const { AppError } = require("../middleware/errorHandler");
const userService = require("./userService");

function publicUser(user) {
  return userService.mapUser(user);
}

function createToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new AppError("Authentication is not configured", 500);
  }

  return jwt.sign({ sub: String(user.id) }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
}

async function register({ name, email, password }) {
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'volunteer')
       RETURNING *`,
      [name, email, passwordHash]
    );
    const user = result.rows[0];
    return { user: publicUser(user), token: createToken(user) };
  } catch (error) {
    if (error.code === "23505") {
      throw new AppError("An account with that email already exists", 409);
    }
    throw error;
  }
}

async function login({ email, password }) {
  const user = await userService.findUserByEmail(email);
  const valid = user && user.password_hash
    ? await bcrypt.compare(password, user.password_hash)
    : false;

  if (!valid) {
    throw new AppError("Invalid email or password", 401);
  }

  return { user: publicUser(user), token: createToken(user) };
}

module.exports = { register, login, publicUser };