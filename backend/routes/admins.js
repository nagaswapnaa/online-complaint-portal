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

router.get('/senior', async (req, res) => {
  try {
    // If you have admins table, change to SELECT id,name,email FROM admins WHERE role='Senior Admin'
    const [rows] = await db.query('SELECT id, name, email, role FROM senior_admins');
    res.json({ success: true, admins: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching senior admins' });
  }
});

// ---------------- Admin Escalate Complaint ----------------
router.post("/escalate/:id", async (req, res) => {
  const complaintId = req.params.id;
  const { adminId, reason } = req.body;

  if (!adminId) return res.status(400).json({ success: false, message: "Please select a senior admin" });
  if (!reason || reason.trim() === "") return res.status(400).json({ success: false, message: "Reason is required" });

  try {
    // Check if complaint exists
    const [complaints] = await db.query("SELECT * FROM complaints WHERE id = ?", [complaintId]);
    if (complaints.length === 0) return res.status(404).json({ success: false, message: "Complaint not found" });

    // Update complaint with escalation info
    await db.query(
      `UPDATE complaints 
       SET escalated = TRUE, escalation_reason = ?, escalation_level = IFNULL(escalation_level, 0) + 1,
           assigned_admin_id = ?, escalated_at = NOW(), updated_at = NOW() 
       WHERE id = ?`,
      [reason, adminId, complaintId]
    );

    // Add notifications
    const complaint = complaints[0];
    await db.query(
      'INSERT INTO notifications (user_id, message, url) VALUES (?, ?, ?)',
      [complaint.user_id, `Your complaint "${complaint.title}" has been escalated to a senior admin.`, `/complaints/${complaintId}`]
    );

    await db.query(
      'INSERT INTO notifications (admin_id, message, url) VALUES (?, ?, ?)',
      [adminId, `You have been assigned escalated complaint ID ${complaintId}.`, `/admin/complaints/${complaintId}`]
    );

    res.json({ success: true, message: "Complaint escalated successfully" });
  } catch (err) {
    console.error("Admin escalation failed:", err);
    res.status(500).json({ success: false, message: "Escalation failed" });
  }
});

module.exports = router;
