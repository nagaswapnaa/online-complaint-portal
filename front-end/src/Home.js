import React from "react";
import "./Home.css";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home-container">
      {/* Main Heading */}
      <h2 className="home-title">
        Welcome to Online Complaint Portal & Feedback Management System
      </h2>

      <p className="home-subtitle">
        Easily register complaints, track their status, and share feedback.
      </p>

      {/* Action Buttons */}
      <div className="button-group">
        <Link to="/signup">
          <button className="btn btn-primary">Signup</button>
        </Link>

        <Link to="/login">
          <button className="btn btn-success">Login</button>
        </Link>

        <Link to="/complaint">
          <button className="btn btn-warning">Complaint Portal</button>
        </Link>

        <Link to="/mycomplaints">
          <button className="btn btn-info">My Complaints</button>
        </Link>

        <Link to="/dashboard">
          <button className="btn btn-dark">Dashboard</button>
        </Link>

        <Link to="/logout">
          <button className="btn btn-danger">Logout</button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
