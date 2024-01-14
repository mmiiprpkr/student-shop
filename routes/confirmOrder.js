var express = require("express");
var router = express.Router();
var mysql = require("../database/database");
const mid = require("./auth");
const jwt = require("jsonwebtoken");

router.get("/confirmOrder/:id", mid, (req, res) => {
  const data = req.body;

  res.render("customer/confirmOrder");
});
// เพิ่มข้อมูลในตาราง
router.post("/confirmOrder/:customerID", mid, (req, res) => {
  const data = req.body;
  console.log("data ", data);

  // ข้อมูลที่ส่งมาจากฟอร์ม
  const { quantitys, customerID, ProductID, ProductPrice, totalPrice } = data;
  const pdl = ProductID.length;

  console.log("quantitys ??  ", quantitys);
  // คำสั่ง SQL เพื่อเพิ่มข้อมูลในตาราง orders
  const insertOrderQuery = `
    INSERT INTO orders (ProductID, cmID, orderDate)
    VALUES (?, ?, NOW())`;

  // คำสั่ง SQL เพื่ออัปเดต stock ในตาราง products
  const updateStockQuery = `
    UPDATE products
    SET unit = unit - ?
    WHERE id = ?`;

  // เชื่อมต่อกับ MySQL
  mysql.connect((err) => {
    if (err) {
      console.error("Error connecting to database:", err);
      return;
    }

    let totalAll = 0; // สร้างตัวแปร totalAll เพื่อเก็บค่ารวมทั้งหมด
    if (typeof ProductID === "string") {
      jwt.sign({ cmID: customerID, ProductLength: 1 }, "ggg", (err, token) => {
        res.cookie("token", token);
      });
    } else {
      jwt.sign(
        { cmID: customerID, ProductLength: ProductID.length },
        "ggg",
        (err, token) => {
          res.cookie("token", token);
        }
      );
    }
    console.log("typepdl", typeof ProductID, "pdl ", ProductID);
    if (typeof ProductID === "string") {
      // มีเพียงรายการเดียว
      const productId = ProductID;
      const quantity = quantitys;
      totalAll = totalPrice; // เพิ่มค่าราคารวมทั้งหมด
      const values = [productId, customerID];
      mysql.query(insertOrderQuery, values, async (err, result) => {
        if (err) {
          console.error("Error inserting order:", err);
          return;
        }
        // สร้างอาร์เรย์ OrderIDs โดยตรวจสอบจำนวน OrderIDs ที่ได้รับ
        const OrderID = result.insertId;
        console.log("From Orders Table" , result)

        const dataset = [OrderID, customerID, productId, quantity];

        const sql =
          "insert into orderdetail (OrderID,cmID,ProductID,Quantity) values (?)";
        mysql.query(sql, [dataset]);

        mysql.query(updateStockQuery,[quantity, productId],(updateErr, updateResult) => {
            if (updateErr) {
              console.error("Error updating stock:", updateErr);
              return;
            }
            console.log("Stock updated for ProductID", productId);
            // เมื่อลูปทั้งหมดเสร็จสิ้นให้ทำการแสดงผลหน้า 'paymentForm'
            res.render(`customer/paymentForm`, {
              totalAll: totalAll,
              customerID,
              OrderID,
              user: req.session.user,
              userid: req.session.userid,
              usertype: req.session.types,
              cmID: req.session.cmID,
            });
            // res.send("การทำรายการซื้อสินค้าเรียบร้อย");
            console.log(totalAll);
          }
        );
      });
    } else {
      for (let i = 0; i < ProductID.length; i++) {
        const productId = ProductID[i];
        const quantity = quantitys[i];
        totalAll = totalPrice; // เพิ่มค่าราคารวมทั้งหมด
        const values = [productId, customerID];
        mysql.query(insertOrderQuery, values, async (err, result) => {
          if (err) {
            console.error("Error inserting order:", err);
            return;
          }

          // สร้างอาร์เรย์ OrderIDs โดยตรวจสอบจำนวน OrderIDs ที่ได้รับ
          const OrderID = result.insertId;

          const dataset = [OrderID, customerID, productId, quantity];

          console.log("   order id  ", quantity);
          const sql =
            "insert into orderdetail (OrderID,cmID,ProductID,Quantity) values (?)";
          mysql.query(sql, [dataset]);

          mysql.query(
            updateStockQuery,
            [quantity, productId],
            (updateErr, updateResult) => {
              if (updateErr) {
                console.error("Error updating stock:", updateErr);
                return;
              }
              console.log("Stock updated for ProductID", productId);

              // เมื่อลูปทั้งหมดเสร็จสิ้นให้ทำการแสดงผลหน้า 'paymentForm'
              if (i === ProductID.length - 1) {
                res.render(`customer/paymentForm`, {
                  totalAll: totalAll,
                  customerID,
                  OrderID,
                  user: req.session.user,
                  userid: req.session.userid,
                  usertype: req.session.types,
                  cmID: req.session.cmID,
                });
                // res.send("การทำรายการซื้อสินค้าเรียบร้อย");
                console.log(totalAll);
              }
            }
          );
        });
      }
    }
  });
});

module.exports = router;
