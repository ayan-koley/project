const express = require("express");
const router = express.Router({ mergeParams: true }); // that use to send :id value in this file
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../util/wrapAsynd.js");
const ExpressError = require("../util/ExpressError.js");
const { isOwner, isLogged, isReviewOwner } = require("../middleware.js");
const reviewController = require("../controllers/reveiw.js");

router.post("/", isLogged, wrapAsync(reviewController.createReview));
// delete review with listing review array
router.delete(
  "/:reviewId",
  isLogged, 
  isReviewOwner,
  wrapAsync(reviewController.destroyReview)
);

module.exports = router;
