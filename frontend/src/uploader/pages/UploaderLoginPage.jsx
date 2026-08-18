import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../shared/components/Navbar";
import Footer from "../../shared/components/Footer";
import {
  FaUser,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaInfoCircle,
} from "react-icons/fa";

function UploaderLoginPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleClear = () => {
    setUserId("");
    setPassword("");
    setPhoneNumber("");
    setError("");
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();

    if (!userId.trim() || !password || !phoneNumber.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${baseUrl}/api/v1/uploader/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId.trim(),
          password: password,
          phone: phoneNumber.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Invalid User ID, Password, or Phone Number.");
        return;
      }

      if (data && data.access_token) {
        localStorage.setItem("uploader_token", data.access_token);
        localStorage.setItem("uploader_id", userId.trim());
        navigate("/uploader/dashboard");
      } else {
        setError("Invalid response from server.");
      }
    } catch (err) {
      console.error("Uploader login error:", err);
      setError("Unable to connect to the server. Please make sure the backend is running.");
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
    <div className="h-screen flex flex-col bg-white uploader-login-page overflow-hidden">
      {/* Navbar */}
      <Navbar onBack={() => navigate("/")} />

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 flex items-center justify-center py-2 px-4 uploader-login-main min-h-0 overflow-y-auto">
        <div className="w-[520px] max-w-full bg-white rounded-xl border border-gray-200 shadow-xl p-5 my-auto">
          {/* Heading */}
          <h2 className="text-2xl font-bold text-gray-800">
            Uploader Portal
          </h2>

          <p className="text-xs text-gray-500 mt-0.5 mb-3">
            Login to manage the On-Screen Marking System script uploads.
          </p>

          <form onSubmit={handleLogin} onKeyDown={handleKeyDown}>
            {/* Uploader User ID */}
            <div className="mb-2.5">
              <label className="text-xs text-gray-500 font-medium">
                Uploader User ID
              </label>

              <div className="mt-1 flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100">
                <FaUser className="text-gray-400 mr-2 text-xs" />

                <input
                  type="text"
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="UPL001"
                  className="w-full outline-none text-sm bg-transparent"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="mb-2.5">
              <label className="text-xs text-gray-500 font-medium">
                Phone Number
              </label>

              <div className="mt-1 flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100">
                <FaPhone className="text-gray-400 mr-2 text-xs" />

                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full outline-none text-sm bg-transparent"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-2.5">
              <label className="text-xs text-gray-500 font-medium">
                Password
              </label>

              <div className="mt-1 flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100">
                <FaLock className="text-gray-400 mr-2 text-xs" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="••••••••"
                  className="w-full outline-none text-sm bg-transparent"
                  autoComplete="new-password"
                  disabled={isLoading}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer ml-2"
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5">
                <p className="text-xs text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition cursor-pointer text-sm"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>

              <button
                type="button"
                onClick={handleClear}
                disabled={isLoading}
                className="w-24 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-gray-700 cursor-pointer text-sm"
              >
                Clear
              </button>
            </div>
          </form>

          {/* Info Banner */}
          <div className="mt-3 bg-gray-100 rounded-lg p-2.5 flex gap-2 items-center">
            <FaInfoCircle className="text-blue-600 shrink-0 text-xs" />

            <p className="text-[11px] text-gray-600">
              Only authorized uploaders can access this portal.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default UploaderLoginPage;