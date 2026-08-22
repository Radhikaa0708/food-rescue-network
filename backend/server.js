require("dotenv").config();

const app = require("./src/app");
const { checkConnection } = require("./src/config/database");

const port = Number(process.env.PORT) || 5000;

if (require.main === module) {
  checkConnection()
    .then(() => {
      console.log("Database connected successfully");
    })
    .catch(() => {
      console.error("Database connection unavailable; API will report unhealthy status");
    })
    .finally(() => {
      app.listen(port, () => {
        console.log(`Food Rescue API listening on port ${port}`);
      });
  });
}

module.exports = app;