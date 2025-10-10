import React, { useEffect, useState } from "react";
import "./Dashboard.css";

function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    newComplaints: 0,
    underReview: 0,
    resolved: 0
  });

  useEffect(() => {
    // Generate random sample numbers
    const total = Math.floor(Math.random() * 50) + 10;
    const newComplaints = Math.floor(Math.random() * 10) + 1;
    const underReview = Math.floor(Math.random() * 15) + 1;
    const resolved = total - newComplaints - underReview;

    setStats({ total, newComplaints, underReview, resolved });
  }, []);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-heading">Welcome to Your Dashboard</h1>
      <p className="dashboard-subheading">
        Here you can track total complaints, new complaints, pending complaints, and resolved complaints.
      </p>

      {/* Top stats cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <h3>Total Complaints</h3>
          <p>{stats.total}</p>
        </div>
        <div className="stat-card new">
          <h3>New Complaints</h3>
          <p>{stats.newComplaints}</p>
        </div>
        <div className="stat-card under-review">
          <h3>Pending Complaints</h3>
          <p>{stats.underReview}</p>
        </div>
        <div className="stat-card resolved">
          <h3>Resolved Complaints</h3>
          <p>{stats.resolved}</p>
        </div>
      </div>

      {/* Bottom detailed stats */}
      <div className="detailed-stats">
        <h2>Complaint Summary</h2>
        <div className="detailed-list">
          <div className="detail-item total">
            <span>Total Complaints:</span>
            <span>{stats.total}</span>
          </div>
          <div className="detail-item new">
            <span>New Complaints:</span>
            <span>{stats.newComplaints}</span>
          </div>
          <div className="detail-item under-review">
            <span>Pending Complaints:</span>
            <span>{stats.underReview}</span>
          </div>
          <div className="detail-item resolved">
            <span>Resolved Complaints:</span>
            <span>{stats.resolved}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
