const { query } = require("../config/database");
const { haversineDistanceKm, roundKm } = require("../utils/distance");
const { markExpiredListings, mapListing } = require("./listingService");

async function findNearbyListings(latitude, longitude, radiusKm) {
  await markExpiredListings();

  const result = await query(
    `SELECT * FROM food_listings
     WHERE status = 'available'
       AND available_until > NOW()
       AND latitude IS NOT NULL
       AND longitude IS NOT NULL`
  );

  return result.rows
    .map((row) => {
      const listing = mapListing(row);
      const distanceKm = roundKm(
        haversineDistanceKm(
          latitude,
          longitude,
          listing.latitude,
          listing.longitude
        )
      );

      return {
        ...listing,
        distance_km: distanceKm,
      };
    })
    .filter((item) => item.distance_km <= radiusKm)
    .sort((a, b) => a.distance_km - b.distance_km);
}

module.exports = {
  findNearbyListings,
};
