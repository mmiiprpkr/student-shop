const exress = require("express");
const router = exress.Router();
const db = require("../database/database");
const mid = require("./auth");
const jwt = require("jsonwebtoken");

router.get("/productcustomer", (req, res) => {
  const sql = "SELECT * FROM products";
  db.query(sql, (err, rs) => {
    if (err) {
      console.log("การดึงข้อมูลผิดพลาด");
      return res.status(500).json({ error: err});

    } else {
      console.log("การดึงข้อมูลสำเร็จ");
      res.render("customer/productcustomer", {
        data: rs,
        user: req.session.user,
        userid: req.session.userid,
        usertype: req.session.types,
      });
    }
  });
});

router.get("/products", mid, (req, res) => {
  const sql = "SELECT * FROM products";
  db.query(sql, (err, rs) => {
    if (err) {
      console.log("การดึงข้อมูลผิดพลาด");
      return res.status(500).json({ error: err});

    } else {
      console.log("การดึงข้อมูลสำเร็จ");
      res.render("admin/products", {
        data: rs,
        user: req.session.user,
        userid: req.session.userid,
        usertype: req.session.types,
        cmID: req.session.cmID,
      });
    }
  });
});

router.get("/productlogin/:id", mid, (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM products";
  db.query(sql, (err, rs) => {
    if (err) {
      console.log("การดึงข้อมูลผิดพลาด");
      return res.status(500).json({ error: err});

    } else {
      console.log("การดึงข้อมูลสำเร็จ");
      res.render("customer/productlogin", {
        items: rs,
        customerID: id,
        user: req.session.user,
        userid: req.session.userid,
        usertype: req.session.types,
        cmID: req.session.cmID,
      });
    }
  });
});

router.get("/allproduct", async (req, res) => {
  const cmID = await req.session.cmID;
  console.log({ data: cmID });
  const sql = `SELECT * from recept as rc join payment as pm on rc.PaymentID = pm.paymentID where cmID = ?`
  db.query(sql, [cmID], (err, rs) => {
    console.log(rs);
    res.render("customer/allproduct", {
      data: rs,
      user: req.session.user,
      userid: req.session.userid,
      usertype: req.session.types,
      cmID: req.session.cmID,
    });
  });
  // return
});
router.get("/neworder", async (req, res) => {
  const cmID = await req.session.cmID;
  console.log({ data: cmID });
  const sql = `SELECT * from recept as rc join payment as pm on rc.PaymentID = pm.paymentID order by rc.PaymentID desc `
  db.query(sql, [cmID], (err, rs) => {
    console.log(rs);
    res.render("admin/neworder", {
      data: rs,
      user: req.session.user,
      userid: req.session.userid,
      usertype: req.session.types,
      cmID: req.session.cmID,
    });
  });
  // return
});
router.get("/oldorder", async (req, res) => {
  const cmID = await req.session.cmID;
  console.log({ data: cmID });
  const sql = `SELECT * from recept as rc join payment as pm on rc.PaymentID = pm.paymentID order by rc.PaymentID desc `
  db.query(sql, [cmID], (err, rs) => {
    console.log(rs);
    res.render("admin/oldorder", {
      data: rs,
      user: req.session.user,
      userid: req.session.userid,
      usertype: req.session.types,
      cmID: req.session.cmID,
    });
  });
  // return
});

module.exports = router;
