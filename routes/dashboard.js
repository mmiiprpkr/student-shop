var express = require("express");
var router = express.Router();
var mysql = require("../database/database");

router.get("/dashboard", async (req, res) => {
  const sql =
    "SELECT SUM(od.Quantity * p.price) as TotalSales FROM orders AS o JOIN orderdetail AS od ON o.OrderID = od.OrderID JOIN products AS p ON od.ProductID = p.id WHERE DATE(o.orderDate) = CURDATE()";
  mysql.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err });
    } else {
      const sql =
        "SELECT sum(od.Quantity) as total FROM products AS p JOIN orderdetail AS od ON od.ProductID = p.id JOIN orders AS o ON o.OrderID = od.OrderID WHERE DATE(o.orderDate) = CURDATE()";
      mysql.query(sql, async (err, rs) => {
        if (err) {
          return res.status(500).send("server error: " + err.message);
        }
        mysql.query(
          "select COUNT(id) as AllproductinStore from products ",
          (err, alld) => {
            if (err) {
              return res.status(500).send("server error: " + err.message);
            }
            const bestseller =
              "SELECT p.name, SUM(od.Quantity) AS TotalQuantity FROM orderdetail AS od JOIN products AS p ON od.ProductID = p.id GROUP BY p.id, p.name ORDER BY TotalQuantity DESC LIMIT 1";
            mysql.query(bestseller, (err, bestsell) => {
              if (err) {
                return res.status(500).send("server error: " + err.message);
              }
              const totalsellall =
                "SELECT SUM(p.price * od.Quantity) AS TotalSales FROM products AS p JOIN orderdetail AS od ON od.ProductID = p.id JOIN orders AS o ON o.OrderID = od.OrderID";
              mysql.query(totalsellall, (err, totalsell) => {
                console.log(alld);
                console.log(rs[0].total);
                console.log(bestsell);
                console.log(totalsell[0].TotalSales);
                res.render("admin/dashboard", {
                  products: result,
                  allproducts: rs,
                  allp: alld[0].AllproductinStore,
                  bestsell: bestsell,
                  totalsell: totalsell[0].TotalSales,
                  numberproduct: rs[0].total,
                  user: req.session.user,
                  userid: req.session.userid,
                  usertype: req.session.types,
                  cmID: req.session.cmID,
                });
              });
            });
            // console.log(alldata);
          }
        );
      });
      console.log(`Result from query: `, result);
    }
  });
});

module.exports = router;
