import React from 'react';
import { Link } from 'react-router-dom';

export default function NavbarTop(){
  return (
    <nav className="navbar navbar-expand-lg navbar-dark main-navbar">
      <div className="container">
        <Link className="navbar-brand" to="/">Complaint Portal</Link>
        <div>
          <ul className="navbar-nav ms-auto d-flex align-items-center">
            <li className="nav-item me-3">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item me-3">
              <Link className="nav-link" to="/complaint">Submit Complaint</Link>
            </li>
            <li className="nav-item">
              <button className="btn btn-danger btn-sm">Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}