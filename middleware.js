const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./util/ExpressError.js");

module.exports.isLogged = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // store in req.session
    req.session.redirectUrl = req.originalUrl;
    req.flash("success", "Please log in!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveredirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let currUser = res.locals.currUser._id;
  let listOwner = await Listing.findById(id);
  if (!res.locals.currUser._id.equals(listOwner.owner._id)) {
    req.flash("error", "you don't have any access to modify in this post");
    return res.redirect(`/listings/show/${id}`);
  }
  next();
};
module.exports.isReviewOwner = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let currUser = res.locals.currUser._id;
  let reviewOwner = await Review.findById(reviewId);
  if (!res.locals.currUser._id.equals(reviewOwner.owner._id)) {
    req.flash("error", "you don't have any access to modify in this post");
    return res.redirect(`/listings/show/${id}`);
  }
  next();
};

module.exports.validaeeListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    // let errmsg = error.details.map((el) => el.message).join(",");
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errmsg);
  } else {
    next();
  }
};

// validation schema
module.exports.validatereviewSchema = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errmsg);
  } else {
    next();
  }
};
