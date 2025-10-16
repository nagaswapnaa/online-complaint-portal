import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [reportData, setReportData] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const navigate = useNavigate();

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
      case "New": return "#3498db"; // Blue
      case "Under Review": return "#e67e22"; // Orange
      case "Resolved": return "#2ecc71"; // Green
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
        setComplaints((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status } : c))
        );
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while updating status");
    }
  };

  const generateReport = async () => {
    try {
      let query = `http://localhost:5000/api/reports/trends?`;
      if (startDate) query += `startDate=${startDate}&`;
      if (endDate) query += `endDate=${endDate}&`;
      if (categoryFilter) query += `category=${categoryFilter}&`;

      const res = await fetch(query);
      const data = await res.json();
      if (data.success) {
        setReportData(data.trends);
        toast.success("Report generated successfully");
      } else {
        toast.error("Failed to generate report");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while generating report");
    }
  };

  const openCount = complaints.filter(
    (c) => c.status === "New" || c.status === "Under Review"
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === "Resolved").length;
  const recentComplaints = [...complaints]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);
  const averageResolutionTime = "3 days"; // placeholder

  const tabs = ["Dashboard", "New", "Under Review", "Resolved", "Reports & Export"];

  const chartData = {
    labels: reportData?.byCategory?.map((c) => c.category) || [],
    datasets: [
      {
        label: "Complaints by Category",
        data: reportData?.byCategory?.map((c) => c.count) || [],
        backgroundColor: "#f1c40f", // Yellow for reports
      },
    ],
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "auto", padding: "30px", fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#f6fff9" }}>
      <ToastContainer />
      <h2 style={{ textAlign: "center", marginBottom: "30px", fontSize: "32px", fontWeight: "bold", color: "#2e7d32" }}>
        Admin Dashboard - Online Complaint Portal
      </h2>

      {/* ---- Tabs ---- */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "30px" }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              marginRight: "12px",
              padding: "12px 25px",
              background: activeTab === tab ? "#2e7d32" : "#e8f5e9",
              color: activeTab === tab ? "#fff" : "#2e7d32",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
              transition: "all 0.3s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ---- Dashboard Tab ---- */}
      {activeTab === "Dashboard" && (
        <div>
          {/* Summary Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "40px" }}>
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
          <h3 style={{ marginBottom: "20px", color: "#2e7d32", fontSize: "22px" }}>Recent Complaints</h3>
          {recentComplaints.length === 0 ? (
            <p style={{ color: "#555" }}>No recent complaints found.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {recentComplaints.map((c) => (
                <div key={c.id} style={complaintCardStyle(statusColor(c.status))}>
                  <p style={{ margin: 0, fontWeight: "bold", fontSize: "16px" }}>Complaint ID: {c.id}</p>
                  <p style={{ margin: "5px 0", fontSize: "16px" }}>{c.title}</p>
                  <p style={{ color: statusColor(c.status), fontWeight: "bold", fontSize: "15px" }}>{c.status}</p>
                  <button onClick={() => navigate(`/admin/escalate/${c.id}`)} style={actionButton("#2e7d32")}>Escalate</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---- Complaints by Status ---- */}
      {["New", "Under Review", "Resolved"].includes(activeTab) && (
        <>
          {loading ? <p>Loading complaints...</p> :
            complaints.filter((c) => c.status === activeTab).map((c) => (
              <div key={c.id} style={complaintCardStyle(statusColor(c.status))}>
                <h3 style={{ marginBottom: "10px" }}>{c.title}</h3>
                <p><b>ID:</b> {c.id}</p>
                <p><b>User ID:</b> {c.user_id}</p>
                <p><b>Category:</b> {c.category}</p>
                <p><b>Urgency:</b> {c.urgency}</p>
                <p><b>Description:</b> {c.description}</p>
                <p><b>Status:</b> <span style={{ color: statusColor(c.status), fontWeight: "bold" }}>{c.status}</span></p>
                <p><b>Submitted:</b> {new Date(c.created_at).toLocaleString()}</p>
                <div style={{ marginTop: "12px" }}>
                  {c.status !== "Under Review" && <button onClick={() => handleStatusUpdate(c.id, "Under Review")} style={actionButton("#e67e22")}>Mark Under Review</button>}
                  {c.status !== "Resolved" && <button onClick={() => handleStatusUpdate(c.id, "Resolved")} style={actionButton("#2ecc71")}>Mark Resolved</button>}
                  <button onClick={() => navigate(`/admin/escalate/${c.id}`)} style={actionButton("#2e7d32")}>Escalate</button>
                </div>
              </div>
            ))
          }
        </>
      )}

      {/* ---- Reports & Export Tab (Step-by-Step) ---- */}
      {activeTab === "Reports & Export" && (
        <div style={{ padding: "25px", backgroundColor: "#e8f5e9", borderRadius: "15px" }}>
          <h2 style={{ marginBottom: "25px", color: "#2e7d32" }}>Reports & Export</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "25px" }}>
            <div>
              <label style={{ fontSize: "16px", fontWeight: "bold" }}>Step 1: Select Start Date</label><br />
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: "16px", fontWeight: "bold" }}>Step 2: Select End Date</label><br />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: "16px", fontWeight: "bold" }}>Step 3: Select Category</label><br />
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={inputStyle}>
                <option value="">All</option>
                <option value="Technical">Technical</option>
                <option value="Service">Service</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <button onClick={generateReport} style={{ ...actionButton("#f1c40f"), fontSize: "16px" }}>Step 4: Generate Report</button>
          </div>

          {reportData && (
            <div style={{ marginBottom: "25px" }}>
              <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
          )}

          <div style={{ display: "flex", gap: "15px" }}>
            <a href="http://localhost:5000/api/reports/export/csv" target="_blank" rel="noreferrer"><button style={actionButton("#3498db")}>Export CSV</button></a>
            <a href="http://localhost:5000/api/reports/export/pdf" target="_blank" rel="noreferrer"><button style={actionButton("#2ecc71")}>Export PDF</button></a>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Styles ----
const cardStyle = { backgroundColor: "#fff", borderRadius: "15px", padding: "25px", textAlign: "center", boxShadow: "0 6px 15px rgba(0,0,0,0.1)" };
const cardTitle = { fontSize: "20px", color: "#2e7d32", marginBottom: "12px" };
const cardValue = { fontSize: "26px", fontWeight: "bold", color: "#2e7d32" };
const actionButton = (color) => ({ padding: "10px 20px", backgroundColor: color, color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", transition: "all 0.3s" });
const complaintCardStyle = (borderColor) => ({ borderLeft: `5px solid ${borderColor}`, padding: "20px", borderRadius: "12px", backgroundColor: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" });
const inputStyle = { padding: "10px", borderRadius: "8px", border: "1px solid #ccc", width: "100%", fontSize: "16px" };

export default AdminDashboard;
