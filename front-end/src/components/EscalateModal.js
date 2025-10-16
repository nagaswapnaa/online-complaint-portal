// src/components/EscalateModal.js
import React, { useState } from "react";
import "./EscalateModal.css";

export default function EscalateModal({ complaintId, onClose, onSubmit }) {
  const [reason, setReason] = useState("");
  const [authority, setAuthority] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason || !authority) {
      alert("Please fill all fields");
      return;
    }
    onSubmit({ reason, authority });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Escalate Complaint #{complaintId}</h2>
        <form onSubmit={handleSubmit}>
          <label>Reason for Escalation:</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why you're escalating..."
          />

          <label>Escalate To:</label>
          <select
            value={authority}
            onChange={(e) => setAuthority(e.target.value)}
          >
            <option value="">Select Authority</option>
            <option value="Senior Admin">Senior Admin</option>
            <option value="Department Head">Department Head</option>
            <option value="System Administrator">System Administrator</option>
          </select>

          <div className="modal-buttons">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Escalate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
