import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UploaderLogin.css";
import Footer from "../../shared/components/Footer";
import { FaUser, FaLock, FaPhone } from "react-icons/fa";

function UploaderLoginPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    if (field === "userId") setUserId(value);
    if (field === "password") setPassword(value);
    if (field === "phoneNumber") setPhoneNumber(value);

    // Dynamic error clearing
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!userId.trim()) {
      newErrors.userId = "This field is required";
    }
    if (!password.trim()) {
      newErrors.password = "This field is required";
    }
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "This field is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const requestBody = {
        user_id: userId,
        password: password,
        phone: phoneNumber,
      };
      console.log("Sending login request:", requestBody);
      
      const baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${baseUrl}/api/v1/uploader/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Login failed:", response.status, errorData);
        setErrors({ general: errorData.detail || "Invalid User ID, Password, or Phone Number" });
        return;
      }

      const data = await response.json();
      if (data && data.access_token) {
        localStorage.setItem("uploader_token", data.access_token);
        localStorage.setItem("uploader_id", userId);
        setErrors({});
        navigate("/uploader/dashboard");
      } else {
        setErrors({ general: "Invalid response from server" });
      }
    } catch (err) {
      setErrors({ general: "Failed to connect to the backend server" });
    }
  };

  return (
    <div className="page">

      <div className="topbar">
        <h2>On-Screen Marking System</h2>
      </div>

      <div className="loginContainer">

        <form className="loginCard" onSubmit={handleLogin}>

          <h2>Uploader Login</h2>

          {errors.general && (
            <div className="errorText" style={{ textAlign: "center", marginBottom: "15px", display: "block" }}>
              {errors.general}
            </div>
          )}

          <div className="inputGroup">
            <label>User ID</label>
            <div className={`input ${errors.userId ? "error-border" : ""}`}>
              <FaUser />
              <input
                type="text"
                placeholder="Enter User ID"
                value={userId}
                onChange={(e) => handleInputChange("userId", e.target.value)}
              />
            </div>
            {errors.userId && <span className="errorText">{errors.userId}</span>}
          </div>

          <div className="inputGroup">
            <label>Password</label>
            <div className={`input ${errors.password ? "error-border" : ""}`}>
              <FaLock />
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />
            </div>
            {errors.password && <span className="errorText">{errors.password}</span>}
          </div>

          <div className="inputGroup">
            <label>Phone Number</label>
            <div className={`input ${errors.phoneNumber ? "error-border" : ""}`}>
              <FaPhone />
              <input
                type="text"
                placeholder="Enter Phone Number"
                value={phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              />
            </div>
            {errors.phoneNumber && <span className="errorText">{errors.phoneNumber}</span>}
          </div>

          <button type="submit" className="loginBtn">
            Login
          </button>

          <p className="helpText">
            Forgot password? <span className="linkText">Contact admin.</span>
          </p>

        </form>

      </div>

      <Footer />

    </div>
  );
}

export default UploaderLoginPage;