import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./login";
import Signup from "./signup";
import MyComplaints from "./MyComplaints";
import AdminDashboard from "./AdminDashboard";
import Dashboard from "./Dashboard";
import ComplaintStatus from "./ComplaintStatus";
import ComplaintPortal from "./ComplaintPortal"; // ✅ new complaint submission page

import EscalateComplaint from "./EscalateComplaint";
import UserEscalateComplaint from "./UserEscalateComplaint";

import ReportsExports from "./ReportsExports";
import ReportChart from './ReportChart';
import Reports from "./Reports";
import AdminReports from "./AdminReports";



// Protected Route Wrapper
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !user.isAdmin) return <Navigate to="/complaint-portal" />;
  return children;
};

// Navbar Component
const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success px-3">
      <span className="navbar-brand fw-bold">Online Complaint Portal</span>
      <div className="ms-auto">
        {!user && (
          <>
            <button className="btn btn-outline-light me-2" onClick={() => navigate("/signup")}>Signup</button>
            <button className="btn btn-outline-light" onClick={() => navigate("/login")}>Login</button>
          </>
        )}
        {user && (
          <>
            {user.isAdmin ? (
              <button className="btn btn-outline-light me-2" onClick={() => navigate("/admin")}>Admin Dashboard</button>
            ) : (
              <>
                <button className="btn btn-outline-light me-2" onClick={() => navigate("/dashboard")}>Dashboard</button>
                <button className="btn btn-outline-light me-2" onClick={() => navigate("/complaint-portal")}>Submit Complaint</button>
                <button className="btn btn-outline-light me-2" onClick={() => navigate("/my-complaints")}>My Complaints</button>
              </>
            )}
            <button className="btn btn-warning" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

// App Component with Routes
function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/complaint-portal" element={<ProtectedRoute><ComplaintPortal /></ProtectedRoute>} />
          <Route path="/my-complaints" element={<ProtectedRoute><MyComplaints /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/status" element={<ProtectedRoute><ComplaintStatus /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" />} />
         <Route path="/admin/escalate/:id" element={ <ProtectedRoute adminOnly={true}> <EscalateComplaint /> </ProtectedRoute>}/>
        <Route path="/escalate/:id" element={ <ProtectedRoute> <UserEscalateComplaint /></ProtectedRoute> }/>
        <Route path="/reports" element={<ReportsExports />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        

        </Routes>
      </div>
    </Router>
  );
}

export default App;
