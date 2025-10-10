import React, { useEffect, useState } from "react";
import { FaExclamationCircle, FaCheckCircle, FaClock, FaFileAlt, FaTag } from "react-icons/fa";
import "./complaint.css";

function MyComplaints() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("New");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/complaints/my/${user.id}`);
        const data = await res.json();
        if (data.success) setComplaints(data.complaints);
        else setError(data.message || "Failed to load complaints");
      } catch (err) {
        setError("Server error while loading complaints");
        console.error(err);
      }
      setLoading(false);
    };

    fetchComplaints();
  }, [user?.id]);

  const statusColor = (status) => {
    switch (status) {
      case "New": return "#1976d2"; // Blue
      case "Under Review": return "#f57c00"; // Orange
      case "Resolved": return "#388e3c"; // Green
      default: return "#9e9e9e";
    }
  };

  const shown = complaints.filter(c => c.status === activeTab);

  return (
    <div className="my-complaints-page">
      <h2 className="page-title">My Complaints</h2>

      {/* Tabs */}
      <div className="tabs-container">
        {["New", "Under Review", "Resolved"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`tab-btn ${activeTab === t ? "active" : ""}`}
            style={{ background: activeTab === t ? statusColor(t) : "#f5f5f5" }}
          >
            {t}
          </button>
        ))}
      </div>

      {loading && <p className="loading-text">Loading complaints...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && shown.length === 0 && <p className="empty-text">No complaints under "{activeTab}"</p>}

      <div className="complaint-cards">
        {!loading && !error && shown.map((c) => (
          <div
            key={c.id}
            className="complaint-card"
            style={{
              borderLeft: `8px solid ${statusColor(c.status)}`, // thicker colored border
              borderRadius: "10px", // rounded corners
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)", // subtle shadow
              padding: "15px",
              marginBottom: "20px",
              backgroundColor: "#fff", // white background
              transition: "transform 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <div className="card-header">
              <h3 className="complaint-title">{c.title}</h3>
              <span className="status-label" style={{ background: statusColor(c.status) }}>{c.status}</span>
            </div>

            <div className="card-body">
              <div className="card-item"><FaTag /> <b>ID:</b> #{c.id}</div>
              <div className="card-item"><FaTag /> <b>Category:</b> {c.category}</div>
              <div className="card-item"><FaExclamationCircle /> <b>Status:</b> {c.status}</div>
              <div className="card-item"><FaClock /> <b>Urgency:</b> {c.urgency}</div>
              <div className="card-item"><b>Submitted:</b> {new Date(c.created_at).toLocaleString()}</div>
              <div className="card-item description"><b>Description:</b> {c.description}</div>

              {c.file && (
                <div className="card-item">
                  <FaFileAlt style={{ marginRight: 6 }} />
                  <a className="file-btn" href={`http://localhost:5000/${c.file}`} target="_blank" rel="noreferrer">View File</a>
                </div>
              )}

              {/* Timeline / Updates */}
              <div className="timeline">
                <h4><FaClock style={{ marginRight: 6 }} /> Timeline / Updates</h4>
                <div className="timeline-item animated">Initial submission</div>
                <div className="timeline-item animated">Under review</div>
                <div className="timeline-item animated">Resolved</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyComplaints;
