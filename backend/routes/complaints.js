// routes/complaints.js
const express = require("express");
const router = express.Router();  // ✅ Make sure this is at the top
const db = require("../db");
const multer = require("multer");
const fs = require("fs");

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

  console.log("Incoming PATCH request for complaint:", id); // Debug
  console.log("REQ BODY:", req.body); // Debug

  if (!status) {
    return res.status(400).json({ success: false, message: "Status is required" });
  }

  const allowedStatuses = ["New", "Under Review", "Resolved"];
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

module.exports = router;
