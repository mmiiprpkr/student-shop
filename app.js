var createError = require("http-errors");
var express = require("express");
var app = express();
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const session = require("express-session");
const cors = require("cors");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var products = require("./routes/products");
var admin = require("./routes/admin");
var search = require("./routes/search");
let order = require("./routes/order");
let confrimOrder = require("./routes/confirmOrder");
let PaymentRoute = require("./routes/payment");
let ReceptRouter = require("./routes/recept");
let DashboardRouter = require("./routes/dashboard");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "mysecretkey",
    resave: true,
    saveUninitialized: true,
  })
);

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use(products);
app.use(admin);
app.use(search);
app.use(order);
app.use(confrimOrder);
app.use(PaymentRoute);
app.use(ReceptRouter);

app.use(DashboardRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

app.listen((5000),(err) => {
  console.log("server is listening on 5000")
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

function checkAuthenticated(req, res, next) {
  if (req.session.user) {
    return next(); // ผู้ใช้ล็อกอินแล้ว, ไปต่อได้
  }
  res.redirect("/login"); // ถ้าไม่ได้ล็อกอิน ให้ redirect ไปหน้าล็อกอิน
}
module.exports = app;
