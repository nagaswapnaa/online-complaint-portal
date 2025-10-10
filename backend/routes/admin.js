const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

// ---------------- Admin Login ----------------
const adminUser = {
  email: "admin@ocp.com",
  passwordHash: bcrypt.hashSync("Admin@123", 10), // hashed password
  name: "Admin"
};

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: "Email and password are required" });

  if (email === adminUser.email && bcrypt.compareSync(password, adminUser.passwordHash)) {
    return res.json({ success: true, message: "Login successful", admin: { name: adminUser.name, email: adminUser.email } });
  } else {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// ---------------- Get All Complaints ----------------
router.get("/complaints", (req, res) => {
  const sql = "SELECT c.id, c.user_id, u.name AS user_name, c.title, c.category, c.status, c.urgency, c.created_at FROM complaints c JOIN users u ON c.user_id = u.id ORDER BY c.created_at DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error", err });
    return res.json({ success: true, complaints: results });
  });
});

// ---------------- Update Complaint Status ----------------
router.put("/complaints/update", (req, res) => {
  const { ids, status } = req.body; // ids = [1,2,3]
  if (!ids || !status) return res.status(400).json({ success: false, message: "IDs and status required" });

  const sql = `UPDATE complaints SET status = ? WHERE id IN (${ids.map(() => "?").join(",")})`;
  db.query(sql, [status, ...ids], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Database error", err });
    return res.json({ success: true, message: `Updated ${result.affectedRows} complaint(s) to "${status}"` });
  });
});

module.exports = router;
