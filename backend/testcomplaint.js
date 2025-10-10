const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

async function submitComplaint() {
  try {
    // 1️⃣ Prepare form data
    const form = new FormData();
    form.append("userId", "17"); // must exist in users table
    form.append("category", "Technical Issue");
    form.append("description", "Screen freezes randomly");
    form.append("urgency", "High");
    form.append("submissionType", "public");

    // Optional file: make sure test.png exists in backend folder
    if (fs.existsSync("test.png")) {
      form.append("file", fs.createReadStream("test.png"));
    }

    // 2️⃣ Send POST request to backend
    const res = await axios.post("http://localhost:5000/complaints/add", form, {
      headers: form.getHeaders(),
    });

    console.log("Response from backend:", res.data);
  } catch (err) {
    console.error("Error submitting complaint:", err.response?.data || err.message);
  }
}

// Run the script
submitComplaint();
