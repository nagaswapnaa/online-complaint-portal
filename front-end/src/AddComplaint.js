import React, { useState } from "react";
import "./complaint.css";

function AddComplaint() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    urgency: "Low",
    submission_type: "public",
    type: "General",
  });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      setMessage("User not logged in!");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", user.id);
    formData.append("title", form.title);
    formData.append("category", form.category);
    formData.append("description", form.description);
    formData.append("urgency", form.urgency);
    formData.append("submission_type", form.submission_type);
    formData.append("type", form.type);
    if (file) formData.append("file", file);

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/complaints/add", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Complaint added successfully!");
        setForm({
          title: "",
          category: "",
          description: "",
          urgency: "Low",
          submission_type: "public",
          type: "General",
        });
        setFile(null);
      } else {
        setMessage(data.message || "Failed to add complaint");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error while adding complaint");
    }
    setLoading(false);
  };

  return (
    <div className="add-complaint-page">
      <h2>Add Complaint</h2>
      {message && <p style={{ color: "red" }}>{message}</p>}
      <form onSubmit={handleSubmit} className="complaint-form">
        <input type="text" name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
        <input type="text" name="category" placeholder="Category" value={form.category} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
        <select name="urgency" value={form.urgency} onChange={handleChange}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <select name="submission_type" value={form.submission_type} onChange={handleChange}>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="General">General</option>
          <option value="Bug">Bug</option>
          <option value="Feedback">Feedback</option>
        </select>
        <input type="file" onChange={handleFileChange} />
        <button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Complaint"}</button>
      </form>
    </div>
  );
}

export default AddComplaint;
