function checkAuthenticated(req, res, next) {
  if (req.session.user) {
    return next(); // ผู้ใช้ล็อกอินแล้ว, ไปต่อได้
  }
  res.redirect("/login"); // ถ้าไม่ได้ล็อกอิน ให้ redirect ไปหน้าล็อกอิน
}

module.exports = checkAuthenticated;
