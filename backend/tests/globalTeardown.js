module.exports = async () => {
  const { closePool } = require("../src/config/database");
  await closePool();
};
