const express = require("express");
const router = express.Router();
const db = require("./db");

// ✅ GET complaint with timeline
router.get("/timeline/:complaintId", (req, res) => {
  const complaintId = req.params.complaintId;

  const qComplaint = `
    SELECT id, user_id, category, description, created_at 
    FROM complaints 
    WHERE id = ?
  `;
  db.query(qComplaint, [complaintId], (err, complaints) => {
    if (err) {
      console.error("Error fetching complaint:", err);
      return res.status(500).json({ success: false, message: "DB error fetching complaint" });
    }
    if (!complaints || complaints.length === 0) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    const complaint = complaints[0];

    const qTimeline = `
      SELECT id, status, comment, updated_by, updated_at 
      FROM complaint_status 
      WHERE complaint_id = ? 
      ORDER BY updated_at ASC
    `;
    db.query(qTimeline, [complaintId], (err2, rows) => {
      if (err2) {
        console.error("Error fetching timeline:", err2);
        return res.status(500).json({ success: false, message: "DB error fetching timeline" });
      }
      return res.json({
        success: true,
        complaint: {
          id: complaint.id,
          user_id: complaint.user_id,
          category: complaint.category,
          description: complaint.description,
          submitted_at: complaint.created_at
        },
        timeline: rows
      });
    });
  });
});

// ✅ POST - update complaint status (admin updates)
router.post("/update", (req, res) => {
  const { complaintId, status, comment, adminName } = req.body;
  if (!complaintId || !status) {
    return res.status(400).json({ success: false, message: "complaintId and status required" });
  }

  const q = `
    INSERT INTO complaint_status 
    (complaint_id, status, comment, updated_by, updated_at) 
    VALUES (?, ?, ?, ?, NOW())
  `;
  db.query(q, [complaintId, status, comment || null, adminName || "Admin"], (err) => {
    if (err) {
      console.error("Error inserting complaint status:", err);
      return res.status(500).json({ success: false, message: "DB error inserting status" });
    }

    // ✅ Optionally update complaints table with latest status
    const qUpdateComplaint = `UPDATE complaints SET latest_status = ? WHERE id = ?`;
    db.query(qUpdateComplaint, [status, complaintId], (err2) => {
      if (err2) {
        console.error("Error updating complaint latest status:", err2);
        // still return success since timeline is updated
      }
      return res.json({ success: true, message: "Status updated successfully" });
    });
  });
});
// ✅ GET all complaints with latest_status
router.get("/all", (req, res) => {
  const q = `
    SELECT id, user_id, category, description, created_at, latest_status 
    FROM complaints 
    ORDER BY created_at DESC
  `;
  db.query(q, (err, results) => {
    if (err) {
      console.error("Error fetching complaints:", err);
      return res.status(500).json({ success: false, message: "DB error fetching complaints" });
    }
    return res.json({ success: true, complaints: results });
  });
});

module.exports = router;
