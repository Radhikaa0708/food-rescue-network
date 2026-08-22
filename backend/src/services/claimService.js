const { pool } = require("../config/database");
const { AppError } = require("../middleware/errorHandler");
const { getUserById, canClaimFood } = require("./userService");
const { mapListing } = require("./listingService");

function mapClaim(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    listing_id: row.listing_id,
    volunteer_id: row.volunteer_id,
    claimed_at: row.claimed_at,
    collected_at: row.collected_at,
    status: row.status,
  };
}

async function listClaims() {
  const result = await pool.query("SELECT * FROM claims ORDER BY claimed_at DESC");
  return result.rows.map(mapClaim);
}

async function getClaimById(id) {
  const result = await pool.query("SELECT * FROM claims WHERE id = $1", [id]);
  const claim = mapClaim(result.rows[0]);

  if (!claim) {
    throw new AppError("Claim not found", 404);
  }

  return claim;
}

async function claimListing(listingId, volunteerId) {
  const volunteer = await getUserById(volunteerId);

  if (!canClaimFood(volunteer)) {
    throw new AppError("Only volunteers or NGOs can claim food listings", 400);
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const listingResult = await client.query(
      "SELECT * FROM food_listings WHERE id = $1 FOR UPDATE",
      [listingId]
    );

    const listing = listingResult.rows[0];

    if (!listing) {
      throw new AppError("Food listing not found", 404);
    }

    if (listing.status !== "available") {
      throw new AppError("Food listing is not available to claim", 409);
    }

    if (new Date(listing.available_until).getTime() <= Date.now()) {
      await client.query(
        "UPDATE food_listings SET status = 'expired' WHERE id = $1",
        [listingId]
      );
      throw new AppError("Food listing has expired", 409);
    }

    const claimResult = await client.query(
      `INSERT INTO claims (listing_id, volunteer_id, status)
       VALUES ($1, $2, 'claimed')
       RETURNING *`,
      [listingId, volunteerId]
    );

    const listingUpdate = await client.query(
      `UPDATE food_listings
       SET status = 'claimed', claimed_by = $1
       WHERE id = $2
       RETURNING *`,
      [volunteerId, listingId]
    );

    await client.query("COMMIT");

    return {
      claim: mapClaim(claimResult.rows[0]),
      listing: mapListing(listingUpdate.rows[0]),
    };
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23505") {
      throw new AppError("Food listing is already claimed", 409);
    }

    throw error;
  } finally {
    client.release();
  }
}

async function changeClaimStatus(claimId, nextStatus) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const claimResult = await client.query(
      "SELECT * FROM claims WHERE id = $1 FOR UPDATE",
      [claimId]
    );

    const claim = claimResult.rows[0];

    if (!claim) {
      throw new AppError("Claim not found", 404);
    }

    if (claim.status === nextStatus) {
      await client.query("COMMIT");
      return mapClaim(claim);
    }

    const allowed = {
      claimed: ["collected", "cancelled"],
      collected: [],
      cancelled: [],
    };

    if (!(allowed[claim.status] || []).includes(nextStatus)) {
      throw new AppError(
        `Cannot change claim status from ${claim.status} to ${nextStatus}`,
        400
      );
    }

    const collectedAt = nextStatus === "collected" ? new Date() : claim.collected_at;

    const updatedClaim = await client.query(
      `UPDATE claims
       SET status = $1, collected_at = $2
       WHERE id = $3
       RETURNING *`,
      [nextStatus, collectedAt, claimId]
    );

    if (nextStatus === "collected") {
      await client.query(
        `UPDATE food_listings
         SET status = 'collected'
         WHERE id = $1`,
        [claim.listing_id]
      );
    }

    if (nextStatus === "cancelled") {
      await client.query(
        `UPDATE food_listings
         SET status = 'available', claimed_by = NULL
         WHERE id = $1 AND status = 'claimed'`,
        [claim.listing_id]
      );
    }

    await client.query("COMMIT");
    return mapClaim(updatedClaim.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  mapClaim,
  listClaims,
  getClaimById,
  claimListing,
  changeClaimStatus,
};
