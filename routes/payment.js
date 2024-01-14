var express = require("express");
var router = express.Router();
var mysql = require("../database/database");
var path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/SlipPayment"); // ตำแหน่งที่เก็บไฟล์
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/payment/:cmID", upload.single("SlipPayment"), (req, res) => {
  const uploadedFile = req.file; // เข้าถึงข้อมูลของไฟล์ที่อัปโหลด

  var values = {
    PayName: req.body.PayName,
    PayAddress: req.body.PayAddress,
    PayTel: req.body.PayTel,
    SlipPayment: uploadedFile.originalname,
    cmID: req.params.cmID,
    TotalAll: req.body.TotalAll,
  };

  var sql = "INSERT INTO payment SET?";
  mysql.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err});
    } else {
      var sql = "SELECT * FROM payment ORDER BY paymentID DESC LIMIT 1";
      mysql.query(sql, (err, result) => {
        if (err) {
          return res.status(500).json({ error: err});

        } else {
          res.render("customer/confirmPaymentForm", {
            payment: result,
            user: req.session.user,
            userid: req.session.userid,
            usertype: req.session.types,
            OrderID: req.params.OrderID,
            PayTel: req.body.PayTel,
            cmID: req.session.cmID,
          });
          console.log("data is", { payment: result });
        }
      });
    }
  });
});

module.exports = router;
