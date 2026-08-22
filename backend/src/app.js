require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { checkConnection } = require("./config/database");
const listingRoutes = require("./routes/listingRoutes");
const userRoutes = require("./routes/userRoutes");
const claimRoutes = require("./routes/claimRoutes");
const authRoutes = require("./routes/authRoutes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.disable("x-powered-by");

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.send("Food Rescue Backend is running!");
});

app.get("/api/health", async (req, res) => {
  let database = "disconnected";
  let databaseError;

  try {
    const connected = await checkConnection();
    if (connected) {
      database = "connected";
    }
  } catch (error) {
    database = "disconnected";
    databaseError = process.env.NODE_ENV === "production"
      ? "PostgreSQL connection failed"
      : error.message;
  }

  res.json({
    success: true,
    message: "Food Rescue API is healthy",
    data: {
      database,
      ...(databaseError ? { databaseError } : {}),
    },
  });
});

app.use("/api/listings", listingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/auth", authRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
