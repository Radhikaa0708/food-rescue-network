const claimService = require("../services/claimService");

async function claimListing(req, res, next) {
  try {
    const result = await claimService.claimListing(
      Number(req.params.id),
      req.user.id
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getClaims(req, res, next) {
  try {
    const claims = await claimService.listClaims();
    res.json({
      success: true,
      data: claims,
      count: claims.length,
    });
  } catch (error) {
    next(error);
  }
}

async function getClaimById(req, res, next) {
  try {
    const claim = await claimService.getClaimById(Number(req.params.id));
    res.json({
      success: true,
      data: claim,
    });
  } catch (error) {
    next(error);
  }
}

async function updateClaimStatus(req, res, next) {
  try {
    const claim = await claimService.changeClaimStatus(
      Number(req.params.id),
      req.body.status
    );

    res.json({
      success: true,
      data: claim,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  claimListing,
  getClaims,
  getClaimById,
  updateClaimStatus,
};
