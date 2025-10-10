import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function SubmitComplaint() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    urgency: "Low",
    submission_type: "public",
    file: null
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
    if (!form.title || !form.category || !form.description) {
      toast.error("All fields are required");
      return;
    }

    const data = new FormData();
    data.append("userId", user.id);
    data.append("title", form.title);
    data.append("category", form.category);
    data.append("description", form.description);
    data.append("urgency", form.urgency);
    data.append("submissionType", form.submission_type);
    if (form.file) data.append("file", form.file);

    try {
      const res = await fetch("http://localhost:5000/api/complaints", {
        method: "POST",
        body: data,
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Failed to submit complaint");
      toast.success("Complaint submitted successfully!");
      setForm({
        title: "",
        category: "",
        description: "",
        urgency: "Low",
        submission_type: "public",
        file: null
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong");
    }
  };

  return (
    <div className="complaint-container">
      <ToastContainer />
      <div className="complaint-box large">
        <h3>Submit Complaint</h3>
        <form className="complaint-form" onSubmit={handleSubmit}>
          <label>Title</label>
          <input type="text" name="title" value={form.title} onChange={handleChange} required />

          <label>Category</label>
          <input type="text" name="category" value={form.category} onChange={handleChange} required />

          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} required />

          <label>Urgency</label>
          <select name="urgency" value={form.urgency} onChange={handleChange}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <label>Submission Type</label>
          <select name="submission_type" value={form.submission_type} onChange={handleChange}>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>

          <label>Attach File (optional)</label>
          <input type="file" name="file" onChange={handleChange} />

          <button type="submit" className="submit-btn">Submit Complaint</button>
        </form>
      </div>
    </div>
  );
}

export default SubmitComplaint;
