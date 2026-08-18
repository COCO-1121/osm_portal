import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBuilding, FaLock, FaKey, FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import "./InstitutionDashboard.css";

function InstitutionLoginPage() {
  const navigate = useNavigate();
  const [instituteId, setInstituteId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/v1/institution/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          institute_id: instituteId.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Institution authentication failed");
      }

      // Save token and session info
      localStorage.setItem("institution_token", data.access_token);
      localStorage.setItem("institute_id", data.institute_id);
      localStorage.setItem("institution_name", data.name);

      navigate("/institution/dashboard");
    } catch (err) {
      setError(err.message || "Failed to connect to backend service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inst-login-wrapper">
      {/* Top Left Back Button */}
      <button className="inst-back-btn" onClick={() => navigate("/")} title="Back to Portal Selection">
        <FaArrowLeft />
      </button>

      <div className="inst-login-card">
        <div className="inst-header">
          <div className="inst-icon-badge">
            <FaBuilding />
          </div>
          <h2>Institution Portal</h2>
          <p className="inst-subtitle">
            Sign in to manage Admin & Uploader accounts for your organization
          </p>
        </div>

        {error && <div className="inst-error-banner">{error}</div>}

        <form onSubmit={handleLogin} className="inst-form">
          <div className="inst-input-group">
            <label>Institute ID</label>
            <div className="input-with-icon">
              <FaBuilding className="field-icon" />
              <input
                type="text"
                placeholder="e.g. INST-001"
                value={instituteId}
                onChange={(e) => setInstituteId(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="inst-input-group">
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

          <button type="submit" className="inst-primary-btn" disabled={loading}>
            {loading ? "Authenticating..." : "Sign In to Institution Portal"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default InstitutionLoginPage;
