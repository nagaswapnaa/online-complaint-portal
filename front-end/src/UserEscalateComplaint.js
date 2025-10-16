import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function UserEscalateComplaint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reason, setReason] = useState("");

  const handleEscalate = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/complaints/escalate/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();

      if (data.success) {
        alert("Your complaint has been escalated successfully!");
        navigate("/my-complaints");
      } else {
        alert(data.message || "Failed to escalate complaint");
      }
    } catch (err) {
      console.error(err);
      alert("Server error while escalating complaint");
    }
  };

  return (
    <div style={{
      maxWidth: "500px",
      margin: "60px auto",
      padding: "20px",
      backgroundColor: "#fff",
      borderRadius: "10px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ marginBottom: "15px" }}>Escalate Complaint #{id}</h2>
      <p>Please provide a reason for escalation:</p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Enter escalation reason..."
        style={{
          width: "100%",
          height: "100px",
          padding: "10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          marginBottom: "15px",
          fontSize: "14px",
        }}
      />
      <button
        onClick={handleEscalate}
        style={{
          backgroundColor: "#c0392b",
          color: "#fff",
          padding: "10px 15px",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        Confirm Escalation
      </button>
    </div>
  );
}

export default UserEscalateComplaint;
