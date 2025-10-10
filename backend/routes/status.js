const express = require("express");
const db = require("../db");
const router = express.Router();

// GET /api/status/:userId
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [complaints] = await db.promise().query(
      "SELECT id, title, category, description, status, created_at FROM complaints WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    res.json({ success: true, complaints });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch complaints" });
  }
});
// GET /api/status/stats/:userId
router.get("/stats/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [total] = await db.promise().query(
      "SELECT COUNT(*) as total FROM complaints WHERE user_id = ?",
      [userId]
    );
    const [pending] = await db.promise().query(
      "SELECT COUNT(*) as pending FROM complaints WHERE user_id = ? AND status IN ('New','Under Review')",
      [userId]
    );
    const [resolved] = await db.promise().query(
      "SELECT COUNT(*) as resolved FROM complaints WHERE user_id = ? AND status='Resolved'",
      [userId]
    );

    res.json({
      success: true,
      stats: {
        total: total[0].total,
        pending: pending[0].pending,
        resolved: resolved[0].resolved,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
});


module.exports = router;
