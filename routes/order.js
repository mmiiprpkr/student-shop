var express = require("express");
const router = express.Router();
var mysql = require("../database/database");
const mid = require("./auth");

router.get("/orders", (req, res) => {
  const quantity = req.query.quantity;
  const data2 = req.query.productIDs;
  console.log(data2);
  const customerID = req.query.customerID;
  console.log(customerID);

  // รับค่า ProductID ที่ถูกส่งมาแยกเป็น Array ด้วยเครื่องหมาย "," แล้วแปลงเป็นตัวเลข
  var productIDs = req.query.productIDs.split(",").map(Number);
  var sql = "SELECT * FROM products WHERE id IN (?) AND unit > 0";
  mysql.query(sql, [productIDs], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err});


    } else {
      let subtotal = 0;
      let subtotals = [];
      let quantitys = [];
      for (let i = 0; i < result.length; i++) {
        const itemSubtotal = result[i].price * quantity; // คำนวณราคารวมของรายการแต่ละรายการ
        subtotal += itemSubtotal; // บวกค่าราคารวมของรายการแต่ละรายการในราคารวมทั้งหมด
        subtotals.push(itemSubtotal); // เพิ่มค่าราคารวมของรายการแต่ละรายการในอาร์เรย์
        console.log(subtotals);
        quantitys.push(quantity);
        console.log(quantitys);
      }
      let total = subtotal; // ให้ total เท่ากับ sub total เริ่มต้น

      res.render("customer/ordersListForm", {
        products: result,
        customerID: customerID,
        quantitys: quantitys,
        subtotals: subtotals,
        total: total,
        user: req.session.user,
        userid: req.session.userid,
        usertype: req.session.types,
        cmID: req.session.cmID,
      });
    }
  });
});

module.exports = router;
