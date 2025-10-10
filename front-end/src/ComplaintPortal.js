import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ComplaintPortal.css";

function ComplaintPortal() {
  const [form, setForm] = useState({
    title: "",
    category: "Technical Issue",
    details: "",
    urgency: "Low",
    submissionType: "public",
    file: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setForm({ ...form, file: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      toast.error("Please login first");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("user_id", user.id); // backend expects user_id
      formData.append("title", form.title);
      formData.append("category", form.category);
      formData.append("description", form.details);
      formData.append("urgency", form.urgency);
      formData.append("submission_type", form.submissionType); // backend expects submission_type
      if (form.file) formData.append("file", form.file);

      const res = await fetch("http://localhost:5000/api/complaints/add", {
        method: "POST",
        body: formData,
      });

      let data;
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server returned invalid response");
      }

      if (!res.ok) throw new Error(data.message || "Failed to submit complaint");

      toast.success("Complaint submitted successfully!");

      // Reset form
      setForm({
        title: "",
        category: "Technical Issue",
        details: "",
        urgency: "Low",
        submissionType: "public",
        file: null,
      });
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(err.message || "Failed to submit complaint");
    }
  };

  return (
    <div className="complaint-container" style={{ backgroundColor: "#e8f5e9", minHeight: "100vh", padding: "40px 20px" }}>
      <ToastContainer />
      <div className="complaint-box" style={{ maxWidth: "700px", margin: "auto", background: "#fff", borderRadius: "12px", padding: "30px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        
        {/* Header */}
        <div className="complaint-header" style={{ textAlign: "center", marginBottom: "20px" }}>
          <h1 style={{ color: "#2e7d32" }}>Welcome to Online Complaint Portal</h1>
          <p style={{ color: "white", fontSize: "26px" }}>
            This is your dashboard where you can register complaints, check status, give feedback, and more.
          </p>
        </div>

        <form
          className="complaint-form"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <label>Complaint Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter complaint title"
            required
          />

          <label>Category</label>
          <select name="category" value={form.category} onChange={handleChange}>
            <option value="Technical Issue">Technical Issue</option>
            <option value="Service Issue">Service Issue</option>
            <option value="Other">Other</option>
          </select>

          <label>Complaint Details</label>
          <textarea
            name="details"
            value={form.details}
            onChange={handleChange}
            placeholder="Describe your complaint in detail"
            required
          />

          <label>Urgency</label>
          <select name="urgency" value={form.urgency} onChange={handleChange}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <label>Submission Type</label>
          <div className="submission-toggle" style={{ marginBottom: "15px" }}>
            <button
              type="button"
              className={form.submissionType === "public" ? "active" : ""}
              onClick={() => setForm({ ...form, submissionType: "public" })}
              style={{
                marginRight: "10px",
                padding: "8px 16px",
                backgroundColor: form.submissionType === "public" ? "#2e7d32" : "#e0e0e0",
                color: form.submissionType === "public" ? "#fff" : "#333",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Public
            </button>
            <button
              type="button"
              className={form.submissionType === "anonymous" ? "active" : ""}
              onClick={() => setForm({ ...form, submissionType: "anonymous" })}
              style={{
                padding: "8px 16px",
                backgroundColor: form.submissionType === "anonymous" ? "#2e7d32" : "#e0e0e0",
                color: form.submissionType === "anonymous" ? "#fff" : "#333",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Anonymous
            </button>
          </div>

          <label>Attachment (optional)</label>
          <input type="file" name="file" onChange={handleChange} style={{ marginBottom: "15px" }} />

          {form.file && (
            <div className="file-info" style={{ marginBottom: "15px" }}>
              <span>{form.file.name} ({(form.file.size / 1024).toFixed(2)} KB)</span>
            </div>
          )}

          <button type="submit" style={{
            backgroundColor: "#2e7d32",
            color: "#fff",
            padding: "12px 20px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}>
            Submit Complaint
          </button>
        </form>
      </div>
    </div>
  );
}

export default ComplaintPortal;
