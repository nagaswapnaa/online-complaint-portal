import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MyComplaints.css";

function MyComplaints() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    if (!user) navigate("/login");
    else fetch(`http://localhost:5000/api/complaints/my/${user.id}`)
           .then(res => res.json())
           .then(data => data.success && setComplaints(data.complaints));
  }, [user, navigate]);

  return (
    <div className="page-container">
      <h1>My Complaints</h1>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Description</th>
            <th>Urgency</th>
            <th>Status</th>
            <th>Submitted On</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map(c => (
            <tr key={c.id}>
              <td>{c.category}</td>
              <td>{c.description}</td>
              <td>{c.urgency}</td>
              <td>{c.status}</td>
              <td>{new Date(c.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MyComplaints;
