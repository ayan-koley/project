const Listing = require("../models/listing");
const Review = require("../models/review.js");


module.exports.createReview = async (req, res) => {
  let list = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.listing);
  list.review.push(newReview);
  newReview.owner = res.locals.currUser._id;
  await newReview.save();
  await list.save();
  res.redirect(`/listings/show/${list._id}`);
};

module.exports.destroyReview = async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, {
    $pull: { review: reviewId },
  });
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/listings/show/${id}`);
};