import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Reports() {
  const [trends, setTrends] = useState({
    byCategory: [],
    byStatus: [],
    byMonth: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    category: "",
  });

  // Fetch trends from backend
  const fetchTrends = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await fetch(`http://localhost:5000/api/reports/trends?${params}`);
      const data = await res.json();
      if (data.success) {
        setTrends(data.trends);
      } else {
        setError(data.message || "Failed to load trends");
      }
    } catch (err) {
      console.error(err);
      setError("Server error while fetching trends");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTrends();
  }, []); // fetch once on mount

  // Export CSV/PDF
  const handleExport = (type) => {
    const url = `http://localhost:5000/api/reports/export/${type}`;
    window.open(url, "_blank"); // download in new tab
  };

  return (
    <div style={{ maxWidth: "900px", margin: "50px auto", padding: "20px" }}>
      <ToastContainer />
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Reports & Export</h2>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        />
        <input
          type="text"
          placeholder="Category"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        />
        <button onClick={fetchTrends}>Apply Filters</button>
      </div>

      {loading && <p>Loading trends...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <>
          <h3>Trends by Category:</h3>
          <ul>
            {trends.byCategory.map((c) => (
              <li key={c.category}>
                {c.category}: {c.count}
              </li>
            ))}
          </ul>

          <h3>Trends by Status:</h3>
          <ul>
            {trends.byStatus.map((s) => (
              <li key={s.status}>
                {s.status}: {s.count}
              </li>
            ))}
          </ul>

          <h3>Trends by Month:</h3>
          <ul>
            {trends.byMonth.map((m) => (
              <li key={m.month}>
                {m.month}: {m.count}
              </li>
            ))}
          </ul>

          {/* Export Buttons */}
          <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
            <button onClick={() => handleExport("csv")}>Export CSV</button>
            <button onClick={() => handleExport("pdf")}>Export PDF</button>
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;
