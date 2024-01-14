const exress = require("express");
const router = exress.Router();
const db = require("../database/database");
const mid = require("./auth");

router.post("/searchProduct", mid, (req, res) => {
  const searchTerm = req.body.searchTerm;
  // const query = `SELECT * FROM products WHERE name LIKE ?`;
  // const searchPattern = `%${searchTerm}%`;
  const query = "select * from products where name like '%" + searchTerm + "%'";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).json({ error: "Database error" });
    } else {
      res.render("searchProduct", {
        data: results,
        user: req.session.user,
        userid: req.session.userid,
        usertype: req.session.types,
        cmID: req.session.cmID,
      });
    }
  });
});

module.exports = router;
