import { useNavigate } from "react-router-dom";
import "./UploaderDashboard.css";

import {
  FaExclamationCircle,
  FaEye,
  FaCalendarAlt,
  FaGraduationCap,
  FaCloudUploadAlt,
  FaSignOutAlt,
  FaHome,
  FaHistory,
  FaQuestionCircle,
} from "react-icons/fa";

function UploaderDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      navigate("/uploader-login");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 px-6 py-5">
            <span className="text-xl font-bold text-gray-800">OSM Portal</span>
          </div>

          <nav className="mt-4 flex flex-col gap-1 px-3">
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-100 text-gray-900 text-sm font-semibold cursor-pointer">
              <FaHome /> Home
            </a>
            <a onClick={() => navigate("/rejected-queue")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium cursor-pointer">
              <FaExclamationCircle /> Rejected Queue
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium cursor-pointer">
              <FaHistory /> History
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium cursor-pointer">
              <FaQuestionCircle /> Support
            </a>
          </nav>
        </div>

        <div className="px-3 pb-5">
          <a onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 text-sm font-medium cursor-pointer">
            <FaSignOutAlt /> Logout
          </a>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">

        {/* Top bar */}
        <header className="flex items-center justify-between bg-white border-b border-gray-200 px-8 py-4">
          <h2 className="text-xl font-bold text-gray-800">On-Screen Marking System</h2>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">Uploader</p>
              <p className="text-xs text-gray-500">ID: 992831</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
              UP
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-8 flex-1">

        <div className="dashboardCard">

          <h1>Uploader</h1>

          <p className="subTitle">
            Manage scanned answer sheets and upload them securely.
          </p>

          {/* Action Buttons */}

          <div className="actionButtons">

            <button
              className="actionBtn"
              onClick={() => navigate("/rejected-queue")}
            >
              <FaExclamationCircle />
              <span>Rejected Queue</span>
            </button>

            <button className="actionBtn">
              <FaEye />
              <span>View Scanned Copy</span>
            </button>

          </div>

          {/* Form */}

          <div className="formSection">

            <div className="field">

              <label>Select Date</label>

              <div className="inputBox">
                <FaCalendarAlt className="icon" />
                <input type="date" />
              </div>

            </div>

            <div className="field">

              <label>Select Exam</label>

              <div className="inputBox">
                <FaGraduationCap className="icon" />

                <select>

                  <option>Select Exam</option>

                  <option>B.Tech Semester 1</option>

                  <option>B.Tech Semester 2</option>

                  <option>BCA Semester 1</option>

                  <option>BCA Semester 2</option>

                  <option>MCA Semester 1</option>

                </select>

              </div>

            </div>

          </div>

          {/* Upload */}

          <div className="uploadSection">

            <button className="uploadBtn">

              <FaCloudUploadAlt />

              Upload

            </button>

          </div>

        </div>

        </main>

      </div>

    </div>
  );
}

export default UploaderDashboard;