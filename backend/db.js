const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",       // your MySQL username
  password: "Swapna@24",       // your MySQL password
  database: "ocp",    // your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection immediately
(async function testConnection() {
  try {
    const connection = await db.getConnection();
    console.log("✅ Database connected successfully!");
    connection.release(); // release the connection back to the pool
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
})();

module.exports = db;
