import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import {
  FaUser,
  FaBuilding,
  FaLock,
  FaEnvelope,
  FaCalendarAlt,
  FaInfoCircle,
  FaTimesCircle,
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

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear field-specific error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    
    // Clear global error when typing
    if (globalError) {
      setGlobalError("");
    }
  };

  const handleClear = () => {
    setFormData({
      userId: "",
      instituteId: "",
      password: "",
      dob: "",
      contact: "",
    });
    setErrors({});
    setGlobalError("");
  };

  const handleLogin = async () => {
    // Validation
    const newErrors = {};
    const requiredFields = ["userId", "instituteId", "password", "dob", "contact"];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = "This field is required.";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await login({
        examiner_id: formData.userId,
        institute_id: formData.instituteId,
        password: formData.password,
        dob: formData.dob,
        contact: formData.contact,
      });

      console.log(response);

      // Save the user ID, institute ID, and name for display on other pages
      localStorage.setItem("examinerUserId", formData.userId);
      localStorage.setItem("examinerInstituteId", formData.instituteId);
      if (response.name) {
        localStorage.setItem("examinerName", response.name);
      }

      navigate("/instruction");
    } catch (error) {
      console.error(error);
      setGlobalError("Invalid credentials provided.");
    }
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

      {/* Global Error for Invalid Credentials */}
      {globalError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
          <FaTimesCircle />
          <span className="text-sm font-medium">{globalError}</span>
        </div>
      )}

      {/* Row 1 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500">User ID</label>
          <div className={`mt-1 flex items-center border rounded-lg px-3 py-2.5 ${errors.userId ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
            <FaUser className={`${errors.userId ? 'text-red-500' : 'text-gray-400'} mr-2`} />
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              placeholder="E1438427"
              className={`w-full outline-none text-sm ${errors.userId ? 'bg-red-50 text-red-800' : 'bg-transparent text-gray-800'}`}
            />
          </div>
          {errors.userId && (
            <div className="text-red-600 text-[12px] mt-1.5 flex items-center gap-1 font-medium">
              <FaTimesCircle /> {errors.userId}
            </div>
          )}
        </div>

        <div>
          <label className="text-xs text-gray-500">Institute ID</label>
          <div className={`mt-1 flex items-center border rounded-lg px-3 py-2.5 ${errors.instituteId ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
            <FaBuilding className={`${errors.instituteId ? 'text-red-500' : 'text-gray-400'} mr-2`} />
            <input
              type="text"
              name="instituteId"
              value={formData.instituteId}
              onChange={handleChange}
              placeholder="INST-123"
              className={`w-full outline-none text-sm ${errors.instituteId ? 'bg-red-50 text-red-800' : 'bg-transparent text-gray-800'}`}
            />
          </div>
          {errors.instituteId && (
            <div className="text-red-600 text-[12px] mt-1.5 flex items-center gap-1 font-medium">
              <FaTimesCircle /> {errors.instituteId}
            </div>
          )}
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div>
          <label className="text-xs text-gray-500">Password</label>
          <div className={`mt-1 flex items-center border rounded-lg px-3 py-2.5 ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
            <FaLock className={`${errors.password ? 'text-red-500' : 'text-gray-400'} mr-2`} />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full outline-none text-sm ${errors.password ? 'bg-red-50 text-red-800' : 'bg-transparent text-gray-800'}`}
            />
          </div>
          {errors.password && (
            <div className="text-red-600 text-[12px] mt-1.5 flex items-center gap-1 font-medium">
              <FaTimesCircle /> {errors.password}
            </div>
          )}
        </div>

        <div>
          <label className="text-xs text-gray-500">Date of Birth</label>
          <div className={`mt-1 flex items-center border rounded-lg px-3 py-2.5 ${errors.dob ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
            <FaCalendarAlt className={`${errors.dob ? 'text-red-500' : 'text-gray-400'} mr-2`} />
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className={`w-full outline-none text-sm ${errors.dob ? 'bg-red-50 text-red-800' : 'bg-transparent text-gray-800'}`}
            />
          </div>
          {errors.dob && (
            <div className="text-red-600 text-[12px] mt-1.5 flex items-center gap-1 font-medium">
              <FaTimesCircle /> {errors.dob}
            </div>
          )}
        </div>
      </div>

      {/* Phone / Email */}
      <div className="mt-3">
        <label className="text-xs text-gray-500">Phone Number / Email</label>
        <div className={`mt-1 flex items-center border rounded-lg px-3 py-2.5 ${errors.contact ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
          <FaEnvelope className={`${errors.contact ? 'text-red-500' : 'text-gray-400'} mr-2`} />
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            placeholder="Enter phone number or email"
            className={`w-full outline-none text-sm ${errors.contact ? 'bg-red-50 text-red-800' : 'bg-transparent text-gray-800'}`}
          />
        </div>
        {errors.contact && (
          <div className="text-red-600 text-[12px] mt-1.5 flex items-center gap-1 font-medium">
            <FaTimesCircle /> {errors.contact}
          </div>
        )}
      </div>

      {/* Forgot Password */}
      <div className="flex justify-end mt-4">
        <p className="text-sm text-gray-500 cursor-pointer hover:text-blue-600 transition">
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
          className="w-28 border rounded-lg hover:bg-gray-100 transition text-gray-700"
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