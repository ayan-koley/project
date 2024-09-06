const passport = require("passport");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");
module.exports.renderSignUpPage = (req, res) => {
  res.render("./users/signup.ejs");
};
module.exports.signUp = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registerUser = await User.register(newUser, password);
    req.login(registerUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to WonderLust!");
      res.redirect("/listings");
    });
  } catch (err) {
    req.flash("error", err.message); // Optionally, use an "error" flash message type
    res.redirect("/signup"); // Redirect after the error
  }
};
module.exports.renderLoginPage = (req, res) => {
  res.render("./Users/login.ejs"); // Ensure the file is named correctly
};
module.exports.loginPage = (req, res) => {
  req.flash("success", "Welcome to WonderLust page!");
  if (!res.locals.redirectUrl) {
    return res.redirect("/listings");
  }
  res.redirect(res.locals.redirectUrl);
};
module.exports.logoutPage = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
  });
  req.flash("success", "User is logged out");
  res.redirect("/listings");
};
