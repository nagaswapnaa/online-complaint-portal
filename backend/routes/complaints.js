const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const fs = require("fs");
const nodemailer = require("nodemailer");

// ------------------ Multer setup ------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "_" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// ------------------ ADD COMPLAINT ------------------
router.post("/add", upload.single("file"), async (req, res) => {
  const { user_id, title, category, description, urgency, submission_type, type } = req.body;
  const file = req.file ? `uploads/${req.file.filename}` : null;

  if (!user_id || !title || !category || !description) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const sql = `
      INSERT INTO complaints
      (user_id, title, category, description, urgency, submission_type, file, status, type, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'New', ?, NOW())
    `;
    const [result] = await db.query(sql, [
      user_id, title, category, description, urgency, submission_type, file, type || "General"
    ]);
    res.json({ success: true, message: "Complaint added successfully", complaintId: result.insertId });
  } catch (err) {
    console.error("Error inserting complaint:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

// ------------------ GET COMPLAINTS BY USER ------------------
router.get("/my/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM complaints WHERE user_id = ? ORDER BY id DESC", [userId]);
    res.json({ success: true, complaints: rows });
  } catch (err) {
    console.error("Error fetching user complaints:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

// ------------------ GET ALL COMPLAINTS (ADMIN) ------------------
router.get("/all", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM complaints ORDER BY id DESC");
    res.json({ success: true, complaints: rows });
  } catch (err) {
    console.error("Error fetching all complaints:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

// ------------------ UPDATE COMPLAINT STATUS ------------------
router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: "Status is required" });
  }

  const allowedStatuses = ["New", "Under Review", "Resolved", "Escalated"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status value" });
  }

  try {
    const [result] = await db.query("UPDATE complaints SET status = ? WHERE id = ?", [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }
    res.json({ success: true, message: `Complaint status updated to "${status}"` });
  } catch (err) {
    console.error("Error updating complaint status:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});
// ---------------- User Escalate Complaint ----------------

router.post("/:id/escalate", async (req, res) => {
  const complaintId = req.params.id;
  const { reason } = req.body; // only reason from user

  if (!reason || reason.trim() === "") {
    return res.status(400).json({ success: false, message: "Reason is required" });
  }

  try {
    // Check complaint exists
    const [complaints] = await db.query("SELECT * FROM complaints WHERE id = ?", [complaintId]);
    if (complaints.length === 0) return res.status(404).json({ success: false, message: "Complaint not found" });

    // Automatically pick first active senior admin
    const [admins] = await db.query("SELECT * FROM senior_admins WHERE active = 1 ORDER BY id LIMIT 1");
    if (admins.length === 0) return res.status(400).json({ success: false, message: "No active senior admin found" });

    const seniorAdmin = admins[0];

    // Update complaint
    await db.query(
      `UPDATE complaints 
       SET escalated = TRUE,
           escalation_reason = ?,
           escalation_level = IFNULL(escalation_level, 0) + 1,
           assigned_admin_id = ?,
           escalated_at = NOW(),
           updated_at = NOW()
       WHERE id = ?`,
      [reason, seniorAdmin.id, complaintId]
    );

    const complaint = complaints[0];

    // Notifications
    await db.query(
      "INSERT INTO notifications (user_id, message, url) VALUES (?, ?, ?)",
      [complaint.user_id, `Your complaint "${complaint.title}" has been escalated to ${seniorAdmin.name}.`, `/complaints/${complaintId}`]
    );
    await db.query(
      "INSERT INTO notifications (admin_id, message, url) VALUES (?, ?, ?)",
      [seniorAdmin.id, `You have been assigned escalated complaint ID ${complaintId}.`, `/admin/complaints/${complaintId}`]
    );

    res.json({ success: true, message: `Complaint escalated to ${seniorAdmin.name}` });
  } catch (err) {
    console.error("User escalation failed:", err);
    res.status(500).json({ success: false, message: "Server error while escalating complaint" });
  }
});


// ---------------- Admin Escalate Complaint ----------------
router.post("/:id/escalate/admin", async (req, res) => {
  const complaintId = req.params.id;
  const { assigned_to, reason } = req.body;

  if (!assigned_to || !reason) return res.status(400).json({ success: false, message: "Admin and reason required" });

  try {
    const [complaints] = await db.query("SELECT * FROM complaints WHERE id = ?", [complaintId]);
    if (complaints.length === 0) return res.status(404).json({ success: false, message: "Complaint not found" });

    // Update complaint
    await db.query(
      `UPDATE complaints 
       SET escalated = TRUE, escalation_reason = ?, escalation_level = IFNULL(escalation_level,0)+1,
           assigned_admin_id = ?, escalated_at = NOW(), updated_at = NOW() 
       WHERE id = ?`,
      [reason, assigned_to, complaintId]
    );

    // Notifications
    const complaint = complaints[0];
    await db.query(
      "INSERT INTO notifications (user_id, message, url) VALUES (?, ?, ?)",
      [complaint.user_id, `Your complaint "${complaint.title}" has been escalated to admin.`, `/complaints/${complaintId}`]
    );
    await db.query(
      "INSERT INTO notifications (admin_id, message, url) VALUES (?, ?, ?)",
      [assigned_to, `You have been assigned escalated complaint ID ${complaintId}.`, `/admin/complaints/${complaintId}`]
    );

    res.json({ success: true, message: "Complaint escalated successfully" });
  } catch (err) {
    console.error("Admin escalation failed:", err);
    res.status(500).json({ success: false, message: "Server error while escalating complaint" });
  }
});

module.exports = router;