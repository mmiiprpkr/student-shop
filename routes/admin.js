const exress = require("express");
const router = exress.Router();
const db = require("../database/database");
const path = require("path");
const multer = require("multer");
const mid = require("./auth");

//set multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images"); // ตำแหน่งที่เก็บไฟล์
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/login", (req, res) =>
  res.render("admin/login", {
    user: req.session.user,
    userid: req.session.userid,
    usertype: req.session.types,
    cmID: req.session.cmID,
  })
);
router.get("/customer/register", (req, res) =>
  res.render("customer/register", {
    user: req.session.user,
    userid: req.session.userid,
    usertype: req.session.types,
    cmID: req.session.cmID,
  })
);
router.get("/productAdd", mid, (req, res) =>
  res.render("admin/productAdd", {
    user: req.session.user,
    userid: req.session.userid,
    usertype: req.session.types,
    cmID: req.session.cmID,
  })
);
router.get("/admin/registerforadmin", mid, (req, res) =>
  res.render("admin/registerforadmin", {
    user: req.session.user,
    userid: req.session.userid,
    usertype: req.session.types,
    cmID: req.session.cmID,
  })
);

router.post("/login", (req, res) => {
  const sql = "SELECT * FROM accounts WHERE username = ? AND password =?";
  const { username, password } = req.body;
  if (!username || !password) {
    console.log("ใส่ข้อมูลให้ครบ");
  }
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.log(err);
    } else {
      if (results.length > 0) {
        if (results[0].types === "admin") {
          const currentDate = new Date().toISOString().split("T")[0]; // วันที่ปัจจุบันในรูปแบบ YYYY-MM-DD
          // สร้างวัตถุ Date ปัจจุบัน
          const currentTime = new Date();
          // แปลงเวลาให้อยู่ในโซนเวลา Asia/Bangkok (GMT+7)
          currentTime.toLocaleString("en-US", { timeZone: "Asia/Bangkok" });
          db.query(
            "INSERT INTO logadmin (logusername, logpassword, date, time) VALUES (?, ?, ?, ?)",
            [username, password, currentDate, currentTime]
          );
          req.session.user = username;
          req.session.types = "admin";
          req.session.userid = "";
          res.redirect("/products");
        } else if (results[0].types === "customer") {
          req.session.user = username;
          req.session.userid = results[0].id;
          req.session.cmID = results[0].cmID;
          req.session.types = "";

          res.redirect("productlogin/" + results[0].cmID);
        } else {
          console.log("ผู้ใช้ผิดประเภท");
          return res.status(500).json({ error: err });
        }
      } else {
        console.log("username or password ไม่ถูกต้อง");

        return res.status(400).send("Incorrect username or password");
      }
    }
  });
});
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("เกิดข้อผิดพลาดในการออกจากระบบ: " + err.message);
      return res.status(500).json({ error: err });
    }
    res.redirect("/?success=logout");
  });
});

router.post("/productAdd", mid, upload.single("image"), (req, res) => {
  const { name, price, unit } = req.body;
  const picture = req.file.filename;
  const sql = "INSERT INTO products (name,price,unit,picture) VALUES(?,?,?,?)";
  if (!name || !price || !unit) {
    console.log("กรุณากรอกข้อมูลให้ครับ");
  }
  db.query(sql, [name, price, unit, picture], (err, rs) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: err });
    } else {
      console.log("การเพิ่มข้อมูลสำเร็จ");
      res.redirect("/products?success=true");
    }
  });
});

router.get("/edit/:id", mid, (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM products WHERE id = ?";
  db.query(sql, [id], (err, rs) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: err });
    } else {
      console.log(rs);
      res.render("admin/productEdit", {
        rs: rs[0],
        user: req.session.user,
        userid: req.session.userid,
        cmID: req.session.cmID,
      });
    }
  });
});

router.post("/edit/:id", mid, upload.single("image"), (req, res) => {
  console.log("post edit products  ", req.body);
  const id = req.params.id;
  const { name, price, unit } = req.body;
  const sqlGetImage = "SELECT picture FROM products WHERE id = ?";
  db.query(sqlGetImage, [id], (err, rs) => {
    if (err) {
      return res.status(500).json({ error: err });
    } else {
      const imageName = req.file ? req.file.filename : rs[0].picture;

      const sqlUpdate =
        "UPDATE products SET name = ?, price = ?, unit = ?, picture = ? WHERE id = ?";
      db.query(sqlUpdate, [name, price, unit, imageName, id], (err, rs) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: err });
        } else {
          console.log("result : ", rs);
          res.redirect("/products?success=true");
        }
      });
    }
  });
});

router.get("/del/:id", mid, (req, res) => {
  const delID = req.params.id;
  const sql = "DELETE FROM products WHERE id = ?";
  db.query(sql, [delID], (err, rs) => {
    if (err) {
      console.log(err);
    } else {
      console.log("การลบข้อมูลสำเร็จ");
      res.redirect("/products?success=del");
    }
  });
});

router.post("/admin/registerforadmin", mid, (req, res) => {
  const { username, password, type } = req.body;

  if (!username || !password) {
    return res.send("กรุณากรอกข้อมูลให้ครบถ้วน");
  }
  const sql =
    "INSERT INTO accounts (username, password, types) VALUES (?, ?, ?)";
  db.query(sql, [username, password, "admin"], (err, result) => {
    if (err) {
      console.log("เกิดข้อผิดพลาดในการลงทะเบียน: " + err.message);
    } else {
      res.redirect("/products");
    }
  });
});
router.post("/register", (req, res) => {
  const sql =
    "INSERT INTO membercustomer (username,password,email,phone,address) VALUES (?,?,?,?,?)";
  const { username, password, email, phone, address } = req.body;
  db.query(sql, [username, password, email, phone, address], (err, rs) => {
    if (err) {
      console.log("การเพิ่มข้อมูลผิดพลาด");
    } else {
      console.log(rs.insertId);
      res.redirect("/login");
      const UserType = "customer";
      const sql2 =
        "INSERT INTO accounts (username ,password,types,cmID) VALUES (?,?,?,?)";
      db.query(sql2, [username, password, UserType, rs.insertId]);
      console.log("การเพิ่มผู้ใช้ใหม่สำเร็จ");
    }
  });
});

router.get("/accept/:id", (req, res) => {
  try {
    const sql = "UPDATE recept SET status = 1 WHERE recept_id = ?";
    db.query(sql, [req.params.id], (err, rs) => {
      if (err) {
        return res.status(500).json({ msg: err });
      } else {
        res.redirect("/neworder");
      }
    });
  } catch (error) {
    return res.status(500).json({ msg: err });
  }
});
router.get("/cancle/:id", (req, res) => {
  try {
    const sql = "UPDATE recept SET status = 0 WHERE recept_id = ?";
    db.query(sql, [req.params.id], (err, rs) => {
      if (err) {
        return res.status(500).json({ msg: err });
      } else {
        res.redirect("/neworder");
      }
    });
  } catch (error) {
    return res.status(500).json({ msg: err });
  }
});
module.exports = router;
