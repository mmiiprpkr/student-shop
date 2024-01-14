var mysql = require("mysql2");
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_products_login_",
});
db.connect((err) => {
  if (err) {
    console.log("database is not connect");
  } else {
    console.log("database connected is", db.config.database);
  }
});
module.exports = db;
