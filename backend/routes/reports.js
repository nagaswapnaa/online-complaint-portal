const express = require("express");
const router = express.Router();
const db = require("../db");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");

// ---------------- GET Complaint Trends ----------------
// GET Complaint Trends with optional filters
router.get("/trends", async (req, res) => {
  const { startDate, endDate, category } = req.query;

  let categoryQuery = "SELECT category, COUNT(*) AS count FROM complaints WHERE 1=1";
  let statusQuery = "SELECT status, COUNT(*) AS count FROM complaints WHERE 1=1";
  let monthlyQuery = "SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count FROM complaints WHERE 1=1";
  const params = [];

  if (startDate && endDate) {
    categoryQuery += " AND created_at BETWEEN ? AND ?";
    statusQuery += " AND created_at BETWEEN ? AND ?";
    monthlyQuery += " AND created_at BETWEEN ? AND ?";
    params.push(startDate, endDate, startDate, endDate, startDate, endDate);
  }

  if (category) {
    categoryQuery += " AND category = ?";
    statusQuery += " AND category = ?";
    monthlyQuery += " AND category = ?";
    params.push(category, category, category);
  }

  categoryQuery += " GROUP BY category";
  statusQuery += " GROUP BY status";
  monthlyQuery += " GROUP BY month ORDER BY month";

  try {
    const [byCategory] = await db.query(categoryQuery, params);
    const [byStatus] = await db.query(statusQuery, params);
    const [byMonth] = await db.query(monthlyQuery, params);

    res.json({
      success: true,
      trends: { byCategory, byStatus, byMonth },
    });
  } catch (err) {
    console.error("Error fetching complaint trends:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});


// ---------------- Export CSV ----------------
router.get("/export/csv", async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM complaints ORDER BY created_at DESC");
    const parser = new Parser();
    const csv = parser.parse(data);

    res.header("Content-Type", "text/csv");
    res.attachment("complaints_report.csv");
    res.send(csv);
  } catch (err) {
    console.error("Failed to export CSV:", err);
    res.status(500).json({ success: false, message: "Failed to export CSV" });
  }
});

// ---------------- Export PDF ----------------
router.get("/export/pdf", async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM complaints ORDER BY created_at DESC");
    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=complaints_report.pdf");

    doc.pipe(res);
    doc.fontSize(18).text("Complaint Report", { align: "center" }).moveDown();

    data.forEach((row, i) => {
      doc.fontSize(12).text(`${i + 1}. ${row.title} - ${row.status} (${row.category})`);
    });

    doc.end();
  } catch (err) {
    console.error("Failed to export PDF:", err);
    res.status(500).json({ success: false, message: "Failed to export PDF" });
  }
});

module.exports = router;
