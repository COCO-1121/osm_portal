import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCrown, FaKey, FaUser, FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import "./SuperAdminDashboard.css";

function SuperAdminLoginPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/v1/super-admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Super Admin authentication failed");
      }

      localStorage.setItem("super_admin_token", data.access_token);
      localStorage.setItem("super_admin_user_id", data.user_id);
      localStorage.setItem("super_admin_name", data.name);

      navigate("/super-admin/dashboard");
    } catch (err) {
      setError(err.message || "Failed to connect to backend service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="super-login-wrapper">
      {/* Top Left Back Button */}
      <button className="super-back-btn" onClick={() => navigate("/")} title="Back to Portal Selection">
        <FaArrowLeft />
      </button>

      <div className="super-login-card">
        <div className="super-header">
          <div className="super-icon-badge">
            <FaCrown />
          </div>
          <h2>OSM Super Admin</h2>
          <p className="super-subtitle">
            Central Management Portal for Registering & Controlling Institutions
          </p>
        </div>

        {error && <div className="super-error-banner">{error}</div>}

        <form onSubmit={handleLogin} className="super-form">
          <div className="super-input-group">
            <label>Super Admin User ID</label>
            <div className="input-with-icon">
              <FaUser className="field-icon" />
              <input
                type="text"
                placeholder="e.g. SUPERADMIN"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="super-input-group">
            <label>Password</label>
            <div className="input-with-icon">
              <FaKey className="field-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="super-primary-btn" disabled={loading}>
            {loading ? "Authenticating..." : "Sign In to Super Admin Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SuperAdminLoginPage;
