import { useNavigate } from "react-router-dom";
import "./UploaderLogin.css";
import Footer from "../components/Footer";
import { FaUser, FaLock, FaPhone } from "react-icons/fa";

function UploaderLoginPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/uploader/dashboard");
  };

  return (
    <div className="page">

      <div className="topbar">
        <h2>On-Screen Marking System</h2>
      </div>

      <div className="loginContainer">

        <div className="loginCard">

          <h2>Uploader Login</h2>

          <div className="inputGroup">
            <label>User ID</label>
            <div className="input">
              <FaUser />
              <input type="text" placeholder="Enter User ID" />
            </div>
          </div>

          <div className="inputGroup">
            <label>Password</label>
            <div className="input">
              <FaLock />
              <input type="password" placeholder="Enter Password" />
            </div>
          </div>

          <div className="inputGroup">
            <label>Phone Number</label>
            <div className="input">
              <FaPhone />
              <input type="text" placeholder="Enter Phone Number" />
            </div>
          </div>

          <button className="loginBtn" onClick={handleLogin}>
            Login
          </button>

          <p className="helpText">
            Forgot password? <span className="linkText">Contact admin.</span>
          </p>

        </div>

      </div>

      <Footer />

    </div>
  );
}

export default UploaderLoginPage;