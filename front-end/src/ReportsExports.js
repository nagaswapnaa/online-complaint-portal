import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReportChart from "./ReportChart";

const ReportsExports = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [complaints, setComplaints] = useState([]);

  const fetchReports = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/reports", {
        params: { startDate, endDate, category },
      });
      setComplaints(res.data);
    } catch (err) {
      console.error("Error fetching reports", err);
    }
  };

  const exportFile = (type) => {
    window.open(`http://localhost:5000/api/reports/export/${type}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#E7EEE0] flex flex-col justify-between">
      {/* Top Section */}
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-700 font-semibold text-sm mb-4"
        >
          ← Back
        </button>

        <h2 className="text-center text-lg font-bold mb-6">Reports & Exports</h2>

        <div className="space-y-6">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-semibold mb-2">Date Range</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 w-1/2"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 w-1/2"
              />
            </div>
          </div>

          {/* Complaint Category */}
          <div>
            <label className="block text-sm font-semibold mb-2">Complaint Categories</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            >
              <option value="">All Categories</option>
              <option value="Water">Water</option>
              <option value="Electricity">Electricity</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Road">Road</option>
            </select>
          </div>

          {/* Export Options */}
          <div>
            <label className="block text-sm font-semibold mb-2">Export Options</label>
            <div className="flex gap-3">
              <button
                onClick={() => exportFile("csv")}
                className="bg-white border border-gray-400 rounded-md px-4 py-2 font-semibold hover:bg-gray-100"
              >
                CSV
              </button>
              <button
                onClick={() => exportFile("pdf")}
                className="bg-white border border-gray-400 rounded-md px-4 py-2 font-semibold hover:bg-gray-100"
              >
                PDF
              </button>
            </div>
          </div>

          {/* Generate Report Button */}
          <button
            onClick={fetchReports}
            className="w-full bg-black text-white py-3 rounded-full font-semibold mt-4 hover:bg-gray-900"
          >
            Generate Report
          </button>
        </div>

        {/* Chart Section */}
        {complaints.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow p-4">
            <ReportChart data={complaints} />
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 text-sm">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex flex-col items-center text-black"
        >
          <span>🏠</span>
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => navigate("/submit")}
          className="flex flex-col items-center text-gray-700"
        >
          <span>📝</span>
          <span>Submit Complaint</span>
        </button>
        <button
          onClick={() => navigate("/my-complaints")}
          className="flex flex-col items-center text-gray-700"
        >
          <span>📄</span>
          <span>My Complaints</span>
        </button>
        <button
          onClick={() => navigate("/profile")}
          className="flex flex-col items-center text-gray-700"
        >
          <span>👤</span>
          <span>Profile</span>
        </button>
      </div>
    </div>
  );
};

export default ReportsExports;
