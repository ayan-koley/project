const express = require("express");
const router = express.Router();
const wrapAsync = require("../util/wrapAsynd.js");
const ExpressError = require("../util/ExpressError.js");
const Listing = require("../models/listing.js");
const { isLogged, isOwner, validaeeListing } = require("../middleware.js");
const Review = require("../models/review.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
const methodOverride = require("method-override");

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    upload.single("listing[image]"),
    validaeeListing,
    wrapAsync(listingController.newListing)
  );

router.get("/show/:id", wrapAsync(listingController.renderShowPage));

// create new route
router.get("/new", isLogged, listingController.renderNewPage);

router.get(
  "/edit/:id",
  isLogged,
  isOwner,
  wrapAsync(listingController.renderEditPage)
);

router
  .route("/:id")
  .put(
    isLogged,
    isOwner,
    upload.single("listing[image]"),
    validaeeListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLogged, isOwner, wrapAsync(listingController.deleteListing));

module.exports = router;
