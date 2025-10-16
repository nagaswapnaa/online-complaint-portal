// src/pages/AdminReports.js
import React, { useEffect, useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

function AdminReports() {
  const [trends, setTrends] = useState({ byCategory: [], byStatus: [], byMonth: [] });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:5000/api/reports/trends?`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      if (categoryFilter) url += `&category=${categoryFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setTrends(data.trends);
    } catch (err) {
      console.error("Error fetching trends:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  const handleExportCSV = () => {
    window.open("http://localhost:5000/api/reports/export/csv", "_blank");
  };

  const handleExportPDF = () => {
    window.open("http://localhost:5000/api/reports/export/pdf", "_blank");
  };

  // Prepare chart data
  const categoryChart = {
    labels: trends.byCategory.map((c) => c.category),
    datasets: [
      {
        label: "Complaints by Category",
        data: trends.byCategory.map((c) => c.count),
        backgroundColor: "#1976d2",
      },
    ],
  };

  const statusChart = {
    labels: trends.byStatus.map((s) => s.status),
    datasets: [
      {
        label: "Complaints by Status",
        data: trends.byStatus.map((s) => s.count),
        backgroundColor: ["#1976d2", "#f57c00", "#388e3c"],
      },
    ],
  };

  const monthlyChart = {
    labels: trends.byMonth.map((m) => m.month),
    datasets: [
      {
        label: "Complaints per Month",
        data: trends.byMonth.map((m) => m.count),
        borderColor: "#1976d2",
        backgroundColor: "rgba(25, 118, 210, 0.2)",
      },
    ],
  };

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto" }}>
      <h2>Complaint Reports & Exports</h2>

      <div style={{ marginBottom: "20px" }}>
        <label>Start Date: </label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <label style={{ marginLeft: "20px" }}>End Date: </label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <label style={{ marginLeft: "20px" }}>Category: </label>
        <input type="text" placeholder="Category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} />
        <button onClick={fetchTrends} style={{ marginLeft: "20px", padding: "5px 10px" }}>Filter</button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px" }}>
        <div style={{ width: "45%" }}>
          <h4>By Category</h4>
          <Bar data={categoryChart} />
        </div>
        <div style={{ width: "45%" }}>
          <h4>By Status</h4>
          <Pie data={statusChart} />
        </div>
      </div>

      <div style={{ marginBottom: "40px" }}>
        <h4>Monthly Complaints</h4>
        <Line data={monthlyChart} />
      </div>

      <div>
        <button onClick={handleExportCSV} style={{ marginRight: "20px", padding: "10px 15px", backgroundColor: "#1976d2", color: "white", border: "none", borderRadius: "5px" }}>
          Export CSV
        </button>
        <button onClick={handleExportPDF} style={{ padding: "10px 15px", backgroundColor: "#388e3c", color: "white", border: "none", borderRadius: "5px" }}>
          Export PDF
        </button>
      </div>

      {loading && <p>Loading trends...</p>}
    </div>
  );
}

export default AdminReports;
