const { use } = require("passport");
const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const { query } = require("express");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("./listings/index.ejs", { allListings });
};

module.exports.renderShowPage = async (req, res) => {
  let { id } = req.params;
  const show = await Listing.findById(id)
    .populate({ path: "review", populate: "owner" })
    .populate("owner");

  if (!show) {
    req.flash("error", "Listing is already deleted");
    return res.redirect("/listings");
  }
  res.render("./listings/show.ejs", { show });
};
module.exports.renderNewPage = (req, res) => {
  res.render("./listings/new.ejs");
};

module.exports.newListing = async (req, res) => {
  req.flash("sucess", "new listing add");
  // geocoding in structured input mode
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  // console.log(req.file);
  // for picute
  let path = req.file.path;
  let filename = req.file.filename;

  const user = new Listing(req.body.listing);
  user.owner = req.user._id;
  user.image = { filename, path };
  user.geometry = response.body.features[0].geometry;
  let show = await user.save();
  res.redirect("/listings");
};
module.exports.renderEditPage = async (req, res) => {
  let { id } = req.params;
  const user = await Listing.findById(id);
  if (!user) {
    req.flash("error", "Listing is deleted");
    res.redirect("/listings");
  }
  let originalImage = user.image.path;
  originalImage = originalImage.replace("/upload", "/upload/w_200");
  res.render("./listings/edit.ejs", { user, originalImage });
};
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  console.log(req.file);

  const user = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (req.file != undefined) {
    let filename = req.file.filename;
    let path = req.file.path;
    user.image = { filename, path };
  }
  await user.save();
  res.redirect("/listings");
};
module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  req.flash("sucess", "Delete successfull");
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
};
