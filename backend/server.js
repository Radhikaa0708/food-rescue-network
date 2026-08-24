require("dotenv").config();

const app = require("./src/app");
const { testConnection } = require("./src/config/database");

const port = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    const connected = await testConnection();

    if (!connected) {
      console.error("Database connection unavailable");
    }
  } catch (error) {
    console.error("Database connection unavailable");
    console.error(error.message);
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`Food Rescue API listening on port ${port}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;