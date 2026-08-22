const { query } = require("../config/database");
const { AppError } = require("../middleware/errorHandler");

function mapUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    role: row.role,
    organization: row.organization,
    location: row.location,
    created_at: row.created_at,
  };
}

async function createUser(payload) {
  const result = await query(
    `INSERT INTO users (name, role, organization, location)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      payload.name,
      payload.role,
      payload.organization || null,
      payload.location || null,
    ]
  );

  return mapUser(result.rows[0]);
}

async function listUsers() {
  const result = await query("SELECT * FROM users ORDER BY id ASC");
  return result.rows.map(mapUser);
}

async function getUserById(id) {
  const result = await query("SELECT * FROM users WHERE id = $1", [id]);
  const user = mapUser(result.rows[0]);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}

function canClaimFood(user) {
  return user.role === "volunteer" || user.role === "ngo";
}

module.exports = {
  mapUser,
  createUser,
  listUsers,
  getUserById,
  canClaimFood,
};
