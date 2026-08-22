require("dotenv").config();

const app = require("./src/app");

const port = Number(process.env.PORT) || 5000;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Food Rescue API listening on port ${port}`);
  });
}

module.exports = app;