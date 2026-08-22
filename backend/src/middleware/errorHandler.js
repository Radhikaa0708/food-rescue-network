function errorHandler(err, req, res, next) {
  console.error("=================================");
  console.error("BACKEND ERROR");
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);
  console.error("=================================");

  res.status(err.status || 500).json({
    success: false,
    error: {
      message: err.message || "Something went wrong",
    },
  });
}

module.exports = errorHandler;