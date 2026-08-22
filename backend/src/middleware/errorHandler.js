module.exports = (err, req, res, next) => {
  console.error("========== API ERROR ==========");
  console.error("Method:", req.method);
  console.error("Path:", req.originalUrl);
  console.error("Message:", err.message);
  console.error("Code:", err.code);
  console.error("Detail:", err.detail);
  console.error("Stack:", err.stack);
  console.error("================================");

  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    success: false,
    error: {
      message:
        process.env.NODE_ENV === "production"
          ? "Something went wrong"
          : err.message,
    },
  });
};