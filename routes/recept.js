var connection = require("../database/database");
var express = require("express");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const thaiFontPath = "G:\\Fonts\\THSarabun.ttf"; // เปลี่ยนเส้นทางไปยังฟอนต์ที่ถูกต้อง
var router = express.Router();
const jwt = require("jsonwebtoken");

// GET /recept
router.get("/recept", async (req, res, next) => {
  const PayName = req.query.PayName;
  const PaymentID = req.query.PaymentID;
  const PayAddress = req.query.PayAddress;
  const TotalAll = req.query.TotalAll;
  const OrderID = req.query.OrderID;
  const PayTel = req.query.PayTel;

  console.log("Pay tellllllllllllllllllllllllll   " + PayTel);
  console.log("Pay mentiddddddddddddddddddddddd   " + PaymentID);
  const { token } = req.cookies;
  const decode = jwt.verify(token, "ggg");
  console.log("token   ", decode.cmID);

  // สร้างอาร์เรย์เพื่อเก็บข้อมูลรายการสินค้า
  const productList = [];

  const datafrom =
    "SELECT * FROM orderdetail AS od JOIN orders AS o ON od.OrderID = o.OrderID join products as p on od.ProductID = p.id WHERE o.cmID = ? ORDER BY o.OrderID DESC LIMIT ?";
  connection.query(datafrom, [decode.cmID, decode.ProductLength], (err, rs) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err });
    } else {
      const date = String(rs[0].orderDate);
      date.replace("GMT+0700", " ");
      console.log("time  " + date);
      rs.forEach((item) => {
        // เพิ่มข้อมูลรายการสินค้าลงในอาร์เรย์ productList
        productList.push({
          name: item.name,
          quantity: item.Quantity,
          price: item.price,
        });
      });

      // สร้างเอกสาร PDF หลังจากเก็บข้อมูลรายการสินค้าเสร็จสิ้น
      const doc = new PDFDocument({
        font: thaiFontPath, // เพิ่มฟอนต์ที่รองรับภาษาไทย
        size: "A4", // กำหนดขนาดกระดาษ A4
        margin: 50, // กำหนดระยะขอบ
      });

      const fileName = `Receipt_${
        new Date().getTime().toString() + decode.cmID
      }.pdf`; // ตั้งชื่อไฟล์ตาม PaymentID และ PayName
      connection.query(
        "insert into recept (OrderDate,PaymentID,recept) values( ? , ? , ?)",
        [rs[0].orderDate, PaymentID, fileName]
      );

      // กำหนดเส้นทางเก็บไฟล์ PDF ในโฟลเดอร์ "recept" ใน Drive C
      const filePath = path.join("public/SlipPayment", fileName);

      doc.pipe(fs.createWriteStream(filePath)); // ใช้ filePath แทน fileName
      doc
        .fontSize(25)
        .text(
          `ใบเสร็จเลขที่  ICT${new Date().getTime().toString() + decode.cmID}`,
          {
            underline: true,
            align: "center",
          }
        ); // ใส่ชื่อใบเสร็จและกำหนดให้เนื้อหาอยู่ตรงกลาง
      doc.moveDown(); // เลื่อนลงไปด้านล่าง
      doc.fontSize(18).text(`ชื่อลูกค้า: ${PayName}`);
      doc.fontSize(18).text(`ที่อยู่: ${PayAddress} `);
      doc.fontSize(18).text(`เวลา: ${date} `);
      doc.fontSize(18).text(`เบอร์โทร: ${PayTel} `);

      doc.moveDown(); // เลื่อนลงไปด้านล่าง
      doc.fontSize(16).text("รายการสินค้า", { underline: true });
      const yHeader = 250; // ความสูงของส่วนหัวตาราง
      const yRowStart = yHeader + 30; // ความสูงเริ่มต้นของแถวแรก

      doc.fontSize(16).text("ชื่อสินค้า", 100, yHeader, {
        width: 200,
        align: "left",
        underline: true,
      });
      doc.fontSize(16).text("จำนวนสินค้า", 350, yHeader, {
        width: 80,
        align: "center",
        underline: true,
      });
      doc.fontSize(16).text("ราคาสินค้า", 450, yHeader, {
        width: 100,
        align: "right",
        underline: true,
      });

      doc.moveDown(); // เลื่อนลงไปด้านล่าง

      productList.forEach((item, index) => {
        const y = yRowStart + index * 30; // คำนวณความสูงของแต่ละรายการ
        doc.fontSize(16).text(item.name, 100, y, { width: 200, align: "left" });
        doc.fontSize(16).text(item.quantity.toString(), 350, y, {
          width: 80,
          align: "center",
        });
        doc
          .fontSize(16)
          .text(item.price.toString(), 450, y, { width: 100, align: "right" });
      });

      doc.moveDown(); // เลื่อนลงไปด้านล่าง
      doc.fontSize(16).text(`ยอดรวม: ${TotalAll} บาท`, null, null, {
        width: 100,
        align: "right",
      });

      doc.end();

      // ส่งหน้าเว็บแสดงฟอร์มใบเสร็จ
      res.redirect("/?success=true");
    }
  });
});

module.exports = router;
