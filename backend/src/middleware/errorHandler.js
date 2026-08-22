module.exports = (err, req, res, next) => {
  console.error("=================================");
  console.error("BACKEND ERROR");
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);
  console.error("=================================");

  res.status(err.status || 500).json({
    success: false,
    error: {
      message:
        process.env.NODE_ENV === "production"
          ? err.message || "Something went wrong"
          : err.message,
    },
  });
};