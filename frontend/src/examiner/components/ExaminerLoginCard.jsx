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

  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleClear = () => {
    setFormData({
      examinerId: "",
      instituteId: "",
      phone: "",
      email: "",
      password: "",
    });
    setFieldErrors({});
    setError("");
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");

    const newFieldErrors = {};
    if (!formData.examinerId.trim()) newFieldErrors.examinerId = "This field is required";
    if (!formData.instituteId.trim()) newFieldErrors.instituteId = "This field is required";
    if (!formData.phone.trim() && !formData.email.trim()) newFieldErrors.phone = "This field is required";
    if (!formData.password.trim()) newFieldErrors.password = "This field is required";

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

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
        localStorage.setItem("examinerToken", data.access_token);
        localStorage.setItem("examiner_token", data.access_token);
        localStorage.setItem("examiner_id", data.examiner_id || formData.examinerId);
        localStorage.setItem("institute_id", data.institute_id || formData.instituteId);
      }

      // Reset flags for new login session
      localStorage.removeItem("examiner_instructions_accepted");
      localStorage.removeItem("examiner_bank_details_updated");

      navigate("/examiner/instructions");
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

        <div className={`mt-1 flex items-center border rounded-lg px-3 py-2.5 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 ${fieldErrors.examinerId ? 'border-red-500 bg-red-50/20' : 'border-gray-300'}`}>

          <FaUserShield className={fieldErrors.examinerId ? "text-red-400 mr-2" : "text-gray-400 mr-2"} />

          <input
            type="text"
            name="examinerId"
            value={formData.examinerId}
            onChange={handleChange}
            placeholder="EXAMINER-0001"
            className="w-full outline-none text-sm"
          />

        </div>
        {fieldErrors.examinerId && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.examinerId}</p>
        )}
      </div>

      {/* Institute */}
      <div className="mb-3">
        <label className="text-xs text-gray-500">
          Institute ID
        </label>

        <div className={`mt-1 flex items-center border rounded-lg px-3 py-2.5 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 ${fieldErrors.instituteId ? 'border-red-500 bg-red-50/20' : 'border-gray-300'}`}>

          <FaBuilding className={fieldErrors.instituteId ? "text-red-400 mr-2" : "text-gray-400 mr-2"} />

          <input
            type="text"
            name="instituteId"
            value={formData.instituteId}
            onChange={handleChange}
            placeholder="INST-001"
            className="w-full outline-none text-sm"
          />

        </div>
        {fieldErrors.instituteId && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.instituteId}</p>
        )}
      </div>

      {/* Phone */}
      <div className="mb-3">
        <label className="text-xs text-gray-500">
          Phone Number
        </label>

        <div className={`mt-1 flex items-center border rounded-lg px-3 py-2.5 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 ${fieldErrors.phone ? 'border-red-500 bg-red-50/20' : 'border-gray-300'}`}>

          <FaPhone className={fieldErrors.phone ? "text-red-400 mr-2" : "text-gray-400 mr-2"} />

          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 XXXXX XXXXX"
            className="w-full outline-none text-sm"
          />

        </div>
        {fieldErrors.phone && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>
        )}
      </div>

      {/* Password */}
      <div className="mb-5">
        <label className="text-xs text-gray-500">
          Password
        </label>

        <div className={`mt-1 flex items-center border rounded-lg px-3 py-2.5 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 ${fieldErrors.password ? 'border-red-500 bg-red-50/20' : 'border-gray-300'}`}>

          <FaLock className={fieldErrors.password ? "text-red-400 mr-2" : "text-gray-400 mr-2"} />

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full outline-none text-sm"
          />

        </div>
        {fieldErrors.password && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
        )}
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