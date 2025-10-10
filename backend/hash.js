const bcrypt = require("bcrypt");

async function generateHash() {
  const password = "Admin@123";
  const hash = await bcrypt.hash(password, 10);
  console.log("Bcrypt Hash:", hash);
}

generateHash();
