import React from 'react';

export default function ProfileCard({ user }) {
  // user: {name, email}
  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">
        <h5 className="card-title">Welcome, {user?.name || 'User'}</h5>
        <p className="card-text">Email: {user?.email || 'user@example.com'}</p>
      </div>
    </div>
  );
}