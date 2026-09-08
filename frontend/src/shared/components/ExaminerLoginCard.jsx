import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../shared/services/apiClient";
import {
  FaUser,
  FaBuilding,
  FaLock,
  FaEnvelope,
  FaCalendarAlt,
  FaInfoCircle,
  FaEye,
  FaEyeSlash,
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

  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
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
  };

  const handleLogin = async () => {
    const newErrors = {};

    if (!formData.userId.trim()) {
      newErrors.userId = "This field is required";
    }
    if (!formData.instituteId.trim()) {
      newErrors.instituteId = "This field is required";
    }
    if (!formData.password.trim()) {
      newErrors.password = "This field is required";
    }
    if (!formData.dob.trim()) {
      newErrors.dob = "This field is required";
    }
    if (!formData.contact.trim()) {
      newErrors.contact = "This field is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await apiClient.post("/examiner/auth/login", {
        examiner_id: formData.userId,
        institute_id: formData.instituteId,
        password: formData.password,
        contact: formData.contact,
        dob: formData.dob,
      });
      const { access_token } = response.data;
      localStorage.setItem('examinerToken', access_token);
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('token', access_token);
      if (response.data.examiner_id) {
        localStorage.setItem('examiner_id', response.data.examiner_id);
        localStorage.setItem('examinerUserId', response.data.examiner_id);
      }
      if (response.data.institute_id) {
        localStorage.setItem('institute_id', response.data.institute_id);
      }
      
      // Reset flags for new login session
      localStorage.removeItem("examiner_instructions_accepted");
      localStorage.removeItem("examiner_bank_details_updated");
      
      navigate("/examiner/instructions");
    } catch (error) {
      console.error("Login failed", error);
      // Optionally add UI feedback here
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

      {/* Row 1 */}

      <div className="grid grid-cols-2 gap-3">

        <div>

          <label className="text-xs text-gray-500">
            User ID
          </label>

          <div className={`mt-1 flex items-center border rounded-lg px-3 py-2.5 ${errors.userId ? 'border-red-500 bg-red-50/20' : 'border-gray-300'}`}>

            <FaUser className={errors.userId ? "text-red-400 mr-2" : "text-gray-400 mr-2"} />

            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              placeholder="EMP-0000"
              className="w-full outline-none text-sm"
            />

          </div>
          {errors.userId && (
            <p className="text-xs text-red-500 mt-1">{errors.userId}</p>
          )}

        </div>

        <div>

          <label className="text-xs text-gray-500">
            Institute ID
          </label>

          <div className={`mt-1 flex items-center border rounded-lg px-3 py-2.5 ${errors.instituteId ? 'border-red-500 bg-red-50/20' : 'border-gray-300'}`}>

            <FaBuilding className={errors.instituteId ? "text-red-400 mr-2" : "text-gray-400 mr-2"} />

            <input
              type="text"
              name="instituteId"
              value={formData.instituteId}
              onChange={handleChange}
              placeholder="INST-123"
              className="w-full outline-none text-sm"
            />

          </div>
          {errors.instituteId && (
            <p className="text-xs text-red-500 mt-1">{errors.instituteId}</p>
          )}

        </div>

      </div>

      {/* Row 2 */}

      <div className="grid grid-cols-2 gap-3 mt-3">

        <div>

          <label className="text-xs text-gray-500">
            Password
          </label>

          <div className={`mt-1 flex items-center border rounded-lg px-3 py-2.5 ${errors.password ? 'border-red-500 bg-red-50/20' : 'border-gray-300'}`}>

            <FaLock className={errors.password ? "text-red-400 mr-2" : "text-gray-400 mr-2"} />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full outline-none text-sm"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer ml-2"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>

          </div>
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password}</p>
          )}

        </div>

        <div>

          <label className="text-xs text-gray-500">
            Date of Birth
          </label>

          <div className={`mt-1 flex items-center border rounded-lg px-3 py-2.5 ${errors.dob ? 'border-red-500 bg-red-50/20' : 'border-gray-300'}`}>

            <FaCalendarAlt className={errors.dob ? "text-red-400 mr-2" : "text-gray-400 mr-2"} />

            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full outline-none text-sm"
            />

          </div>
          {errors.dob && (
            <p className="text-xs text-red-500 mt-1">{errors.dob}</p>
          )}

        </div>

      </div>

      {/* Phone / Email */}

      <div className="mt-3">

        <label className="text-xs text-gray-500">
          Phone Number / Email
        </label>

        <div className={`mt-1 flex items-center border rounded-lg px-3 py-2.5 ${errors.contact ? 'border-red-500 bg-red-50/20' : 'border-gray-300'}`}>

          <FaEnvelope className={errors.contact ? "text-red-400 mr-2" : "text-gray-400 mr-2"} />

          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            placeholder="Enter phone number or email"
            className="w-full outline-none text-sm"
          />

        </div>
        {errors.contact && (
          <p className="text-xs text-red-500 mt-1">{errors.contact}</p>
        )}

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