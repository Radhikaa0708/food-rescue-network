class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      message: "Route not found",
    },
  });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";

  const message =
    statusCode === 500 && isProduction
      ? "Something went wrong"
      : err.message || "Something went wrong";

  const payload = {
    success: false,
    error: {
      message,
    },
  };

  if (!isProduction && statusCode === 500) {
    payload.error.details = err.message;
  }

  res.status(statusCode).json(payload);
}

module.exports = {
  AppError,
  notFoundHandler,
  errorHandler,
};
