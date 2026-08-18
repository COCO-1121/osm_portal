import React from "react";
import { useNavigate } from "react-router-dom";
import "./RoleSelection.css";

import { FaCrown, FaBuilding, FaCloudUploadAlt, FaUserGraduate, FaUserShield } from "react-icons/fa";

function RoleSelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="loginPage">
      <h1 className="title">On-Screen Marking System (OSM)</h1>

      <div className="loginContainer">
        <div className="rightSide">

          {/* Level 1: Super Admin */}
          <button className="roleBtn superBtn" onClick={() => navigate("/super-admin/login")}>
            <FaCrown />
            OSM Super Admin - Manage Institutions
          </button>

          {/* Level 2: Institution Portal */}
          <button className="roleBtn instBtn" onClick={() => navigate("/institution/login")}>
            <FaBuilding />
            Institution Portal - Setup Admin & Uploader
          </button>

          <div className="portal-divider">
            <span>Direct Role Access</span>
          </div>

          <button className="roleBtn" onClick={() => navigate("/admin/login")}>
            <FaUserShield />
            Admin Login
          </button>

          <button className="roleBtn" onClick={() => navigate("/uploader/login")}>
            <FaCloudUploadAlt />
            Uploader Login
          </button>

          <button className="roleBtn" onClick={() => navigate("/examiner/login")}>
            <FaUserGraduate />
            Examiner Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoleSelectionPage;