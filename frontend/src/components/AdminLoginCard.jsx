import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaUserShield,
  FaBuilding,
  FaPhone,
  FaLock,
  FaInfoCircle,
} from "react-icons/fa";

function AdminLoginCard() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    adminId: "",
    instituteId: "",
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleClear = () => {
    setFormData({
      adminId: "",
      instituteId: "",
      phone: "",
      password: "",
    });
  };

  const handleLogin = () => {
    // Backend authentication will be added later
    navigate("/admin/dashboard");
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
            placeholder="ADMIN-0001"
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

      {/* Buttons */}
      <div className="flex gap-3">

        <button
          onClick={handleLogin}
          className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-lg transition"
        >
          Login
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

export default AdminLoginCard;