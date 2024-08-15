if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const app = express();
const path = require("path");
const wrapAsync = require("./util/wrapAsynd.js");
const ExpressError = require("./util/ExpressError.js");
const Review = require("./models/review.js");
// express router
const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
// express-session cookies
const session = require("express-session");
const MongoStore = require("connect-mongo");
// flash message
const flash = require("connect-flash");
// for authorization
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const { validaeeListing, validatereviewSchema } = require("./middleware.js");
const { env } = require("process");

// connection with mongoDB
const atlasdbUrl = process.env.ATLASDB_URL;
main()
  .then(() => {
    console.log("Connect to DB");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(atlasdbUrl);
}

const store = MongoStore.create({
  mongoUrl: atlasdbUrl,
  crypto: {
    secret: process.env.SECRECT,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("error occured on mongo session ", err);
});

// session
const sessionOption = {
  store,
  secret: process.env.SECRECT,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};
app.use(session(sessionOption));
// passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ejs path & decleration
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);

app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
// for decode query string
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
// flashing
app.use(flash());

app.use((req, res, next) => {
  res.locals.sucess = req.flash("sucess");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// listing port
app.listen(8080, () => {
  console.log("Server is started 8080 port");
});

// app.get("/", (req, res) => {
//   res.redirect("hii i am working");
// });

app.get("/demo", async (req, res) => {
  let fakeUser = new User({
    email: "apnacollege@mail.com",
    username: "ayan_koley",
  });
  let registerUser = await User.register(fakeUser, "password");
  res.send(registerUser);
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("*", (req, res, next) => {
  next(new ExpressError(400, "Page not found"));
});
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something went wrong" } = err;
  res.status(statusCode).send(message);
});
