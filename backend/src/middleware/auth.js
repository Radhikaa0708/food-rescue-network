const jwt = require("jsonwebtoken");
const { AppError } = require("./errorHandler");
const { getUserById } = require("../services/userService");

function getSecret() {
  if (!process.env.JWT_SECRET) {
    throw new AppError("Authentication is not configured", 500);
  }
  return process.env.JWT_SECRET;
}

async function requireAuth(req, res, next) {
  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(new AppError("Authentication required", 401));
  }

  try {
    const payload = jwt.verify(token, getSecret());
    req.user = await getUserById(Number(payload.sub));
    return next();
  } catch (error) {
    if (error.statusCode === 500) {
      return next(error);
    }
    return next(new AppError("Invalid or expired authentication token", 401));
  }
}

module.exports = { requireAuth };