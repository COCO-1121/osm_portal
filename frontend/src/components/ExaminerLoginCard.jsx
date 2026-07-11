import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaUser,
  FaBuilding,
  FaLock,
  FaEnvelope,
  FaCalendarAlt,
  FaInfoCircle,
} from "react-icons/fa";

function ExaminerLoginCard() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userId: "",
    instituteId: "",
    password: "",
    dob: "",
    contact: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleClear = () => {
    setFormData({
      userId: "",
      instituteId: "",
      password: "",
      dob: "",
      contact: "",
    });
  };

  const handleLogin = () => {
    // Backend authentication will be added later
    navigate("/instruction");
  };

  return (
    <div className="w-[600px] bg-white rounded-xl border border-gray-200 shadow-xl p-5">

      {/* Heading */}

      <h2 className="text-3xl font-bold text-gray-800">
        Examiner Portal
      </h2>

      <p className="text-gray-500 text-sm mt-1 mb-5">
        Access your assigned scripts and marking dashboard.
      </p>

      {/* Row 1 */}

      <div className="grid grid-cols-2 gap-3">

        <div>

          <label className="text-xs text-gray-500">
            User ID
          </label>

          <div className="mt-1 flex items-center border rounded-lg px-3 py-2.5">

            <FaUser className="text-gray-400 mr-2" />

            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              placeholder="EMP-0000"
              className="w-full outline-none text-sm"
            />

          </div>

        </div>

        <div>

          <label className="text-xs text-gray-500">
            Institute ID
          </label>

          <div className="mt-1 flex items-center border rounded-lg px-3 py-2.5">

            <FaBuilding className="text-gray-400 mr-2" />

            <input
              type="text"
              name="instituteId"
              value={formData.instituteId}
              onChange={handleChange}
              placeholder="INST-123"
              className="w-full outline-none text-sm"
            />

          </div>

        </div>

      </div>

      {/* Row 2 */}

      <div className="grid grid-cols-2 gap-3 mt-3">

        <div>

          <label className="text-xs text-gray-500">
            Password
          </label>

          <div className="mt-1 flex items-center border rounded-lg px-3 py-2.5">

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

        <div>

          <label className="text-xs text-gray-500">
            Date of Birth
          </label>

          <div className="mt-1 flex items-center border rounded-lg px-3 py-2.5">

            <FaCalendarAlt className="text-gray-400 mr-2" />

            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full outline-none text-sm"
            />

          </div>

        </div>

      </div>

      {/* Phone / Email */}

      <div className="mt-3">

        <label className="text-xs text-gray-500">
          Phone Number / Email
        </label>

        <div className="mt-1 flex items-center border rounded-lg px-3 py-2.5">

          <FaEnvelope className="text-gray-400 mr-2" />

          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            placeholder="Enter phone number or email"
            className="w-full outline-none text-sm"
          />

        </div>

      </div>

      {/* Forgot Password */}

      <div className="flex justify-end mt-4">

        <p className="text-sm text-gray-500">
          Forgot Password? Contact Admin.
        </p>

      </div>

      {/* Buttons */}

      <div className="flex gap-3 mt-5">

        <button
          onClick={handleLogin}
          className="flex-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg py-2.5 font-semibold transition"
        >
          Login
        </button>

        <button
          onClick={handleClear}
          className="w-28 border rounded-lg hover:bg-gray-100 transition"
        >
          Clear
        </button>

      </div>

      {/* Bottom Info */}

      <div className="mt-5 bg-gray-100 rounded-lg p-3 flex gap-2">

        <FaInfoCircle className="text-blue-600 mt-1" />

        <p className="text-xs text-gray-600">
          First-time login? Use your provided system credentials.
        </p>

      </div>

    </div>
  );
}

export default ExaminerLoginCard;