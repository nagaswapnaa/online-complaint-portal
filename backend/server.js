// ------------------ IMPORTS ------------------
const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// ------------------ APP SETUP ------------------
const app = express();
const PORT = process.env.PORT || 5000;

// ------------------ MIDDLEWARE ------------------
// Enable CORS (allow frontend requests)
app.use(
  cors({
    origin: "http://localhost:3000", // your React frontend
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json()); // Parse JSON bodies
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded files

// ------------------ ROUTES ------------------
try {
  const authRoutes = require("./routes/auth");
  const complaintRoutes = require("./routes/complaints");
  const adminRoutes = require("./routes/admins");
  const reportRoutes = require("./routes/reports");

  // Make sure all imported routes export a router
  app.use("/api/auth", authRoutes);
  app.use("/api/complaints", complaintRoutes);
  app.use("/api/admins", adminRoutes);
  app.use("/api/reports", reportRoutes);
} catch (err) {
  console.error("Error loading routes:", err);
}

// ------------------ ESCALATION JOB ------------------
try {
  require("./escalationJob"); // background cron task
} catch (err) {
  console.error("Error loading escalation job:", err);
}

// ------------------ TEST ROUTE ------------------
app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "API is working 🚀" });
});

// ------------------ START SERVER ------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
