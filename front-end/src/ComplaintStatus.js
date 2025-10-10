import React, { useEffect, useState } from "react";

function ComplaintStatus() {
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState("New");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/complaints/user/${user.id}`);
        const data = await res.json();
        if (data.success) setComplaints(data.complaints);
      } catch (err) {
        console.error("Fetch complaints failed:", err);
      }
    };
    fetchComplaints();
  }, [user.id]);

  const filteredComplaints = complaints.filter(c => c.status === activeTab);

  const getStatusBadge = (status) => {
    if (status === "New") return <span className="badge bg-primary">New</span>;
    if (status === "Under Review") return <span className="badge bg-warning text-dark">In Progress</span>;
    if (status === "Resolved") return <span className="badge bg-success">Resolved</span>;
  };

  return (
    <div className="container mt-4">
      <h2>Complaint Status</h2>

      {/* Tabs */}
      <ul className="nav nav-tabs mt-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "New" ? "active" : ""}`}
            onClick={() => setActiveTab("New")}
          >
            New Tickets
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "Under Review" ? "active" : ""}`}
            onClick={() => setActiveTab("Under Review")}
          >
            In Progress
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "Resolved" ? "active" : ""}`}
            onClick={() => setActiveTab("Resolved")}
          >
            Resolved Cases
          </button>
        </li>
      </ul>

      {/* Cards */}
      <div className="row mt-4">
        {filteredComplaints.length > 0 ? (
          filteredComplaints.map((c) => (
            <div key={c.id} className="col-md-4 mb-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title">#{c.id} - {c.category}</h5>
                  <p className="card-text">{c.description}</p>
                  {getStatusBadge(c.status)}
                  <p className="text-muted mt-2">
                    Created: {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center mt-4">No complaints in this category</p>
        )}
      </div>
    </div>
  );
}

export default ComplaintStatus;
