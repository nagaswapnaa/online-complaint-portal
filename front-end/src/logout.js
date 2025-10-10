import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("user"); // clear stored user info
    navigate("/login"); // redirect to login
  }, [navigate]);

  return <p>Logging out...</p>;
}
