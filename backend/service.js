// service.js
import bcrypt from "bcryptjs";
import pool from "./db.js";  // ✅ import pool

// Save user into DB
export async function registerUser(name, email, password) {
  const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
  if (rows.length > 0) {
    throw new Error("Email already registered");
  }

  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    [name, email, hash]
  );
  return result.insertId;
}

// Validate user during login
export async function loginUser(email, password) {
  const [rows] = await pool.query(
    "SELECT id, name, email, password_hash FROM users WHERE email = ?",
    [email]
  );
  if (rows.length === 0) {
    throw new Error("Invalid email or password");
  }
  const user = rows[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    throw new Error("Invalid email or password");
  }
  return { id: user.id, name: user.name, email: user.email };
}