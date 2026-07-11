import { useNavigate } from "react-router-dom";
import "./RoleSelection.css";

import { FaCloudUploadAlt, FaUserGraduate, FaUserShield } from "react-icons/fa";

function RoleSelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="loginPage">

      <h1 className="title">On-Screen Marking System</h1>

      <div className="loginContainer">

        <div className="rightSide">

          <h2>Login</h2>

          <button className="roleBtn" onClick={() => navigate("/uploader-login")}>
            <FaCloudUploadAlt />
            Uploader
          </button>

          <button className="roleBtn" onClick={() => navigate("/login")}>
            <FaUserGraduate />
            Examiner
          </button>

          <button className="roleBtn" onClick={() => navigate("/admin-login")}>
            <FaUserShield />
            Admin
          </button>

        </div>

      </div>

    </div>
  );
}

export default RoleSelectionPage;