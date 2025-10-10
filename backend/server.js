const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ------------------ MIDDLEWARE ------------------
// Enable CORS including PATCH method
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ------------------ ROUTES ------------------
app.use("/api/auth", require("./routes/auth")); // Auth routes
app.use("/api/complaints", require("./routes/complaints")); // Complaints routes

// ------------------ TEST ROUTE ------------------
app.get("/api/test", (req, res) => res.json({ success: true, message: "API is working 🚀" }));

// ------------------ START SERVER ------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
