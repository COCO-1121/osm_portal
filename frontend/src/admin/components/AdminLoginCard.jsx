import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";

import {
  FaUserShield,
  FaBuilding,
  FaPhone,
  FaLock,
  FaInfoCircle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

function AdminLoginCard() {
  const navigate = useNavigate();
  const { updateAdmin } = useAdmin();
  const [formData, setFormData] = useState({
    adminId: "",
    instituteId: "",
    phone: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Remove previous error when user starts editing
    if (error) {
      setError("");
    }
  };

  const handleClear = () => {
    setFormData({
      adminId: "",
      instituteId: "",
      phone: "",
      password: "",
    });

    setError("");
  };

  const handleLogin = async () => {
    // Validate fields actually used by the backend
    if (!formData.adminId.trim() || !formData.password || !formData.instituteId.trim() ||
    !formData.phone.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(
        `${baseUrl}/api/v1/auth/admin/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: formData.adminId.trim(),
            institute_id: formData.instituteId.trim(),
            phone: formData.phone.trim(),
            password: formData.password,

          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Login failed. Please check your credentials.");
        return;
      }

      // Store authentication information
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("token_type", data.token_type);
      localStorage.setItem("admin_user", JSON.stringify(data.user));
      updateAdmin(data.user);
      navigate("/admin/dashboard");
    }
      catch (err) {
      console.error("Admin login error:", err);

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="w-[600px] bg-white rounded-xl border border-gray-200 shadow-xl p-5">
      {/* Heading */}
      <h2 className="text-3xl font-bold text-gray-800">
        Admin Portal
      </h2>

      <p className="text-sm text-gray-500 mt-1 mb-5">
        Login to manage the On-Screen Marking System.
      </p>

      {/* Admin ID */}
      <div className="mb-3">
        <label className="text-xs text-gray-500">
          Admin User ID
        </label>

        <div className="mt-1 flex items-center border border-gray-300 rounded-lg px-3 py-2.5 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100">
          <FaUserShield className="text-gray-400 mr-2" />

          <input
            type="text"
            name="adminId"
            value={formData.adminId}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="ADM001"
            className="w-full outline-none text-sm"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Institute */}
      <div className="mb-3">
        <label className="text-xs text-gray-500">
          Institute ID
        </label>

        <div className="mt-1 flex items-center border border-gray-300 rounded-lg px-3 py-2.5 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100">
          <FaBuilding className="text-gray-400 mr-2" />

          <input
            type="text"
            name="instituteId"
            value={formData.instituteId}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="INST-001"
            className="w-full outline-none text-sm"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Phone */}
      <div className="mb-3">
        <label className="text-xs text-gray-500">
          Phone Number
        </label>

        <div className="mt-1 flex items-center border border-gray-300 rounded-lg px-3 py-2.5 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100">
          <FaPhone className="text-gray-400 mr-2" />

          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="+91 XXXXX XXXXX"
            className="w-full outline-none text-sm"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Password */}
      <div className="mb-3">
        <label className="text-xs text-gray-500">
          Password
        </label>

        <div className="mt-1 flex items-center border border-gray-300 rounded-lg px-3 py-2.5 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100">
          <FaLock className="text-gray-400 mr-2" />

          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="••••••••"
            className="w-full outline-none text-sm"
            disabled={isLoading}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer ml-2"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleLogin}
          disabled={isLoading}
          className="flex-1 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

        <button
          type="button"
          onClick={handleClear}
          disabled={isLoading}
          className="w-28 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Clear
        </button>
      </div>

      {/* Info */}
      <div className="mt-4 bg-gray-100 rounded-lg p-3 flex gap-2">
        <FaInfoCircle className="text-blue-600 mt-1" />

        <p className="text-xs text-gray-600">
          Only authorized administrators can access this portal.
        </p>
      </div>
    </div>
  );
}

export default AdminLoginCard;