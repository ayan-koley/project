const express = require("express");
const app = express();
const router = express.Router();
const wrapAsync = require("../util/wrapAsynd.js");
const ExpressError = require("../util/ExpressError.js");
const User = require("../models/user.js");
const passport = require("passport");
const { saveredirectUrl } = require("../middleware.js");
const userController = require("../controllers/user.js");

app.use(express.urlencoded({ extended: true }));

router
  .route("/signup")
  .get(userController.renderSignUpPage)
  .post(wrapAsync(userController.signUp));

router
  .route("/login")
  .get(userController.renderLoginPage)
  .post(
    saveredirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.loginPage
  );

router.get("/logout", userController.logoutPage);

module.exports = router;
