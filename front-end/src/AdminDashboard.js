import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");

  useEffect(() => {
    async function fetchComplaints() {
      try {
        const res = await fetch("http://localhost:5000/api/complaints/all");
        const data = await res.json();
        if (data.success) setComplaints(data.complaints);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch complaints");
      } finally {
        setLoading(false);
      }
    }
    fetchComplaints();
  }, []);

  const statusColor = (status) => {
    switch (status) {
      case "New": return "#3498db";
      case "Under Review": return "#e67e22";
      case "Resolved": return "#2ecc71";
      default: return "#7f8c8d";
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/complaints/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while updating status");
    }
  };

  // ---- Stats ----
  const openCount = complaints.filter((c) => c.status === "New" || c.status === "Under Review").length;
  const resolvedCount = complaints.filter((c) => c.status === "Resolved").length;
  const recentComplaints = [...complaints].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  ).slice(0, 5);

  // Dummy average resolution time (you can calculate from DB later)
  const averageResolutionTime = "3 days";

  const tabs = ["Dashboard", "New", "Under Review", "Resolved"];

  return (
    <div style={{ maxWidth: "1100px", margin: "auto", padding: "30px" }}>
      <ToastContainer />
      <h2 style={{ textAlign: "center", marginBottom: "25px", fontSize: "26px", fontWeight: "bold" }}>
        Admin Dashboard - Online Complaint Portal
      </h2>

      {/* Tab Navigation */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "25px" }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              marginRight: "12px",
              padding: "10px 22px",
              background: activeTab === tab ? "#2c3e50" : "#f1f1f1",
              color: activeTab === tab ? "#fff" : "#333",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "15px",
              transition: "all 0.3s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ---- Dashboard Overview ---- */}
      {activeTab === "Dashboard" && (
        <div>
          {/* Summary Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            <div style={cardStyle}>
              <h3 style={cardTitle}>Open Complaints</h3>
              <p style={cardValue}>{openCount}</p>
            </div>
            <div style={cardStyle}>
              <h3 style={cardTitle}>Resolved Complaints</h3>
              <p style={cardValue}>{resolvedCount}</p>
            </div>
            <div style={cardStyle}>
              <h3 style={cardTitle}>Average Resolution Time</h3>
              <p style={cardValue}>{averageResolutionTime}</p>
            </div>
          </div>

          {/* Recent Complaints */}
          <h3 style={{ marginBottom: "15px" }}>Recent Complaints</h3>
          {recentComplaints.length === 0 ? (
            <p>No recent complaints found.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {recentComplaints.map((c) => (
                <div
                  key={c.id}
                  style={{
                    borderLeft: `5px solid ${statusColor(c.status)}`,
                    padding: "15px",
                    borderRadius: "8px",
                    backgroundColor: "#fff",
                    boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
                  }}
                >
                  <p style={{ margin: 0, fontWeight: "bold" }}>Complaint ID: {c.id}</p>
                  <p style={{ margin: "5px 0" }}>{c.title}</p>
                  <p style={{ color: statusColor(c.status), fontWeight: "bold" }}>{c.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---- Complaints by Status ---- */}
      {activeTab !== "Dashboard" && (
        <>
          {loading ? (
            <p>Loading complaints...</p>
          ) : (
            complaints
              .filter((c) => c.status === activeTab)
              .map((c) => (
                <div
                  key={c.id}
                  style={{
                    border: `3px solid ${statusColor(c.status)}`,
                    borderRadius: "10px",
                    padding: "18px",
                    marginBottom: "20px",
                    boxShadow: "0px 3px 6px rgba(0,0,0,0.1)",
                  }}
                >
                  <h3 style={{ marginBottom: "10px" }}>{c.title}</h3>
                  <p><b>ID:</b> {c.id}</p>
                  <p><b>User ID:</b> {c.user_id}</p>
                  <p><b>Category:</b> {c.category}</p>
                  <p><b>Urgency:</b> {c.urgency}</p>
                  <p><b>Description:</b> {c.description}</p>
                  <p>
                    <b>Status:</b>{" "}
                    <span style={{ color: statusColor(c.status), fontWeight: "bold" }}>
                      {c.status}
                    </span>
                  </p>
                  <p><b>Submitted:</b> {new Date(c.created_at).toLocaleString()}</p>
                  <div style={{ marginTop: "12px" }}>
                    {c.status !== "Under Review" && (
                      <button
                        onClick={() => handleStatusUpdate(c.id, "Under Review")}
                        style={actionButton("#e67e22")}
                      >
                        Mark Under Review
                      </button>
                    )}
                    {c.status !== "Resolved" && (
                      <button
                        onClick={() => handleStatusUpdate(c.id, "Resolved")}
                        style={actionButton("#2ecc71")}
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))
          )}
        </>
      )}
    </div>
  );
}

// ---- Reusable Styles ----
const cardStyle = {
  backgroundColor: "#fff",
  borderRadius: "12px",
  padding: "20px",
  textAlign: "center",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
};

const cardTitle = {
  fontSize: "18px",
  color: "#333",
  marginBottom: "10px",
};

const cardValue = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#2c3e50",
};

const actionButton = (color) => ({
  marginRight: "10px",
  padding: "8px 18px",
  backgroundColor: color,
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontWeight: "bold",
  cursor: "pointer",
});

export default AdminDashboard;
