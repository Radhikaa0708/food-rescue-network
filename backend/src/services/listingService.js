const { pool } = require("../config/database");
const { AppError } = require("../middleware/errorHandler");

const ALLOWED_TRANSITIONS = {
  available: ["claimed", "expired", "cancelled"],
  claimed: ["collected", "cancelled"],
  collected: ["delivered"],
  delivered: [],
  expired: [],
  cancelled: [],
};

function mapListing(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    provider_name: row.provider_name,
    food_type: row.food_type,
    quantity: row.quantity === null ? null : Number(row.quantity),
    description: row.description,
    location: row.location,
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    available_until: row.available_until,
    status: row.status,
    claimed_by: row.claimed_by,
    created_at: row.created_at,
  };
}

async function markExpiredListings() {
  await pool.query(
    `UPDATE food_listings
     SET status = 'expired'
     WHERE status = 'available'
       AND available_until <= NOW()`
  );
}

async function createListing(payload) {
  const listingStatus =
    payload.available_until &&
    new Date(payload.available_until).getTime() <= Date.now()
      ? "expired"
      : "available";

  const result = await pool.query(
    `INSERT INTO food_listings (
        provider_name,
        food_type,
        quantity,
        description,
        location,
        latitude,
        longitude,
        available_until,
        status
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      payload.provider_name,
      payload.food_type,
      payload.quantity,
      payload.description || null,
      payload.location || null,
      payload.latitude ?? null,
      payload.longitude ?? null,
      payload.available_until,
      listingStatus,
    ]
  );

  return mapListing(result.rows[0]);
}

async function listListings(filters = {}) {
  await markExpiredListings();

  const conditions = [];
  const params = [];

  const status = filters.status || "available";

  params.push(status);
  conditions.push(`status = $${params.length}`);

  if (status === "available") {
    conditions.push("available_until > NOW()");
  }

  if (filters.food_type) {
    params.push(filters.food_type);
    conditions.push(`food_type ILIKE $${params.length}`);
  }

  if (filters.location) {
    params.push(`%${filters.location}%`);
    conditions.push(`location ILIKE $${params.length}`);
  }

  const result = await pool.query(
    `SELECT *
     FROM food_listings
     WHERE ${conditions.join(" AND ")}
     ORDER BY available_until ASC`,
    params
  );

  return result.rows.map(mapListing);
}

async function getListingById(id) {
  await markExpiredListings();

  const result = await pool.query(
    "SELECT * FROM food_listings WHERE id = $1",
    [id]
  );

  const listing = mapListing(result.rows[0]);

  if (!listing) {
    throw new AppError("Food listing not found", 404);
  }

  return listing;
}

async function updateListing(id, payload) {
  const existing = await getListingById(id);

  const next = {
    provider_name:
      payload.provider_name ?? existing.provider_name,

    food_type:
      payload.food_type ?? existing.food_type,

    quantity:
      payload.quantity ?? existing.quantity,

    description:
      payload.description !== undefined
        ? payload.description
        : existing.description,

    location:
      payload.location !== undefined
        ? payload.location
        : existing.location,

    latitude:
      payload.latitude !== undefined
        ? payload.latitude
        : existing.latitude,

    longitude:
      payload.longitude !== undefined
        ? payload.longitude
        : existing.longitude,

    available_until:
      payload.available_until ?? existing.available_until,
  };

  const updatedStatus =
    existing.status === "available" &&
    new Date(next.available_until).getTime() <= Date.now()
      ? "expired"
      : existing.status;

  const result = await pool.query(
    `UPDATE food_listings
     SET provider_name = $1,
         food_type = $2,
         quantity = $3,
         description = $4,
         location = $5,
         latitude = $6,
         longitude = $7,
         available_until = $8,
         status = $9
     WHERE id = $10
     RETURNING *`,
    [
      next.provider_name,
      next.food_type,
      next.quantity,
      next.description,
      next.location,
      next.latitude,
      next.longitude,
      next.available_until,
      updatedStatus,
      id,
    ]
  );

  return mapListing(result.rows[0]);
}

async function changeListingStatus(id, nextStatus) {
  const listing = await getListingById(id);

  const allowed = ALLOWED_TRANSITIONS[listing.status] || [];

  if (listing.status === nextStatus) {
    return listing;
  }

  if (!allowed.includes(nextStatus)) {
    throw new AppError(
      `Cannot change status from ${listing.status} to ${nextStatus}`,
      400
    );
  }

  const claimedBy =
    nextStatus === "available"
      ? null
      : listing.claimed_by;

  const result = await pool.query(
    `UPDATE food_listings
     SET status = $1,
         claimed_by = $2
     WHERE id = $3
     RETURNING *`,
    [nextStatus, claimedBy, id]
  );

  return mapListing(result.rows[0]);
}

function isListingCurrentlyAvailable(listing) {
  if (!listing || listing.status !== "available") {
    return false;
  }

  return (
    new Date(listing.available_until).getTime() >
    Date.now()
  );
}

module.exports = {
  mapListing,
  markExpiredListings,
  createListing,
  listListings,
  getListingById,
  updateListing,
  changeListingStatus,
  isListingCurrentlyAvailable,
  ALLOWED_TRANSITIONS,
};