import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EscalateComplaint() {
  const { id } = useParams(); // complaint id
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [selected, setSelected] = useState("");
  const [reason, setReason] = useState("");

  // Fetch senior admins on mount
  useEffect(() => {
    async function loadAdmins() {
      try {
        const res = await fetch("http://localhost:5000/api/admins/senior");
        const data = await res.json();
        if (data.success) {
          setAdmins(data.admins);
        } else {
          toast.error("Failed to fetch senior admins");
        }
      } catch (err) {
        console.error(err);
        toast.error("Server error while loading admins");
      }
    }
    loadAdmins();
  }, []);

  const handleSubmit = async () => {
    if (!selected) return toast.error("Please select a senior admin");
    if (!reason.trim()) return toast.error("Please enter a reason for escalation");

    try {
      const res = await fetch(`http://localhost:5000/api/admins/escalate/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: selected, reason }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Complaint escalated successfully!");
        setTimeout(() => navigate("/admin/dashboard"), 2000);
      } else {
        toast.error(data.message || "Failed to escalate complaint");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error during escalation");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", padding: "30px" }}>
      <ToastContainer />
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Escalate Complaint #{id}
      </h2>

      <p>Select a senior admin to assign this complaint to:</p>
      <select
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="">-- Select Senior Admin --</option>
        {admins.map((admin) => (
          <option key={admin.id} value={admin.id}>
            {admin.name} ({admin.email})
          </option>
        ))}
      </select>

      <textarea
        placeholder="Enter reason for escalation"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          marginBottom: "20px",
          minHeight: "80px",
        }}
      />

      <button
        onClick={handleSubmit}
        style={{
          width: "100%",
          backgroundColor: "#2c3e50",
          color: "white",
          padding: "12px",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Confirm Escalation
      </button>
    </div>
  );
}

export default EscalateComplaint;
