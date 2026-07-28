import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaUserShield,
  FaBuilding,
  FaPhone,
  FaLock,
  FaInfoCircle,
} from "react-icons/fa";

function ExaminerLoginCard() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    examinerId: "",
    instituteId: "",
    phone: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleClear = () => {
    setFormData({
      examinerId: "",
      instituteId: "",
      phone: "",
      email: "",
      password: "",
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${baseUrl}/api/v1/examiner/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examiner_id: formData.examinerId,
          institute_id: formData.instituteId,
          contact: formData.phone || formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Invalid login details");
      }

      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        if (data.examiner_id) {
          localStorage.setItem("examiner_id", data.examiner_id);
        }
      }

      navigate("/examiner/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[600px] bg-white rounded-xl border border-gray-200 shadow-xl p-5">

      {/* Heading */}
      <h2 className="text-3xl font-bold text-gray-800">
        Examiner Portal
      </h2>

      <p className="text-sm text-gray-500 mt-1 mb-5">
        Login to manage the On-Screen Marking System.
      </p>

      {/* Admin ID */}
      <div className="mb-3">
        <label className="text-xs text-gray-500">
          Examiner User ID
        </label>

        <div className="mt-1 flex items-center border border-gray-300 rounded-lg px-3 py-2.5 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100">

          <FaUserShield className="text-gray-400 mr-2" />

          <input
            type="text"
            name="examinerId"
            value={formData.examinerId}
            onChange={handleChange}
            placeholder="EXAMINER-0001"
            className="w-full outline-none text-sm"
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
            placeholder="INST-001"
            className="w-full outline-none text-sm"
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
            placeholder="+91 XXXXX XXXXX"
            className="w-full outline-none text-sm"
          />

        </div>
      </div>

      {/* Password */}
      <div className="mb-5">
        <label className="text-xs text-gray-500">
          Password
        </label>

        <div className="mt-1 flex items-center border border-gray-300 rounded-lg px-3 py-2.5 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100">

          <FaLock className="text-gray-400 mr-2" />

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full outline-none text-sm"
          />

        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          onClick={handleClear}
          className="w-28 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
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

export default ExaminerLoginCard;