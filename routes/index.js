var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res) {
  res.render("index", {
    user: req.session.user,
    userid: req.session.userid,
    usertype: req.session.types,
    cmID: req.session.cmID,
  }); // หรือคุณสามารถไม่ส่ง user ไปเลย
});
router.get("/contact", function (req, res) {
  res.render("contact", {
    title: "contact",
    user: req.session.user,
    userid: req.session.userid,
    usertype: req.session.types,
    cmID: req.session.cmID,
  });
});
router.get("/service", function (req, res) {
  res.render("service", {
    user: req.session.user,
    userid: req.session.userid,
    usertype: req.session.types,
    cmID: req.session.cmID,
  });
});
module.exports = router;
