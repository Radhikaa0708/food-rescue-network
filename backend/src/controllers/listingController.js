const listingService = require("../services/listingService");
const locationService = require("../services/locationService");

async function createListing(req, res, next) {
  try {
    const listing = await listingService.createListing(req.body);
    res.status(201).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
}

async function getListings(req, res, next) {
  try {
    const listings = await listingService.listListings({
      status: req.query.status,
      food_type: req.query.food_type,
      location: req.query.location,
    });

    res.json({
      success: true,
      data: listings,
      count: listings.length,
    });
  } catch (error) {
    next(error);
  }
}

async function getListingById(req, res, next) {
  try {
    const listing = await listingService.getListingById(Number(req.params.id));
    res.json({
      success: true,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
}

async function updateListing(req, res, next) {
  try {
    const listing = await listingService.updateListing(
      Number(req.params.id),
      req.body
    );

    res.json({
      success: true,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
}

async function updateListingStatus(req, res, next) {
  try {
    const listing = await listingService.changeListingStatus(
      Number(req.params.id),
      req.body.status
    );

    res.json({
      success: true,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
}

async function getNearbyListings(req, res, next) {
  try {
    const listings = await locationService.findNearbyListings(
      Number(req.query.latitude),
      Number(req.query.longitude),
      Number(req.query.radius || 10)
    );

    res.json({
      success: true,
      data: listings,
      count: listings.length,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createListing,
  getListings,
  getListingById,
  updateListing,
  updateListingStatus,
  getNearbyListings,
};
