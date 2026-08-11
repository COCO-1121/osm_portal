import {
  FaChartPie,
  FaFileAlt,
  FaSignOutAlt,
  FaHome,
  FaUsers,
  FaHistory,
  FaUserCog,
  FaExclamationTriangle,
} from "react-icons/fa";

import { NavLink, useNavigate } from "react-router-dom";

function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (confirmLogout) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("token_type");
      localStorage.removeItem("admin_user");
      localStorage.removeItem("admin");
      navigate("/", { replace: true });
    }
  };

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      {/* Admin Panel Heading */}
      <div className="h-16 px-6 border-b border-gray-200 flex items-center">
        <h2 className="text-xl font-bold text-blue-600 tracking-tight">
          Admin Panel
        </h2>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1 overflow-y-auto flex-1">
        {/* Home */}
        <div
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer font-medium text-sm"
        >
          <FaHome className="text-gray-400 text-base flex-shrink-0" />
          <span>Home</span>
        </div>

        {/* Dashboard */}
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl no-underline transition text-sm font-medium ${
              isActive
                ? "text-blue-600 bg-blue-50 font-semibold"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`
          }
        >
          <FaChartPie className="text-base flex-shrink-0" />
          <span>Dashboard</span>
        </NavLink>

        {/* Rejected Scripts */}
        <NavLink
          to="/admin/rejected-scripts"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl no-underline transition text-sm font-medium ${
              isActive
                ? "text-blue-600 bg-blue-50 font-semibold"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`
          }
        >
          <FaFileAlt className="text-base flex-shrink-0" />
          <span>Rejected Scripts</span>
        </NavLink>

        {/* UFM Cases */}
        <NavLink
          to="/admin/ufm-cases"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl no-underline transition text-sm font-medium ${
              isActive
                ? "text-blue-600 bg-blue-50 font-semibold"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`
          }
        >
          <FaExclamationTriangle className="text-base flex-shrink-0" />
          <span>UFM Cases</span>
        </NavLink>

        {/* Examiner Management */}
        <NavLink
          to="/admin/examiners"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl no-underline transition text-sm font-medium ${
              isActive
                ? "text-blue-600 bg-blue-50 font-semibold"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`
          }
        >
          <FaUsers className="text-base flex-shrink-0" />
          <span>Examiner Management</span>
        </NavLink>

        {/* Audit Logs */}
        <NavLink
          to="/admin/audit-logs"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl no-underline transition text-sm font-medium ${
              isActive
                ? "text-blue-600 bg-blue-50 font-semibold"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`
          }
        >
          <FaHistory className="text-base flex-shrink-0" />
          <span>Audit Logs</span>
        </NavLink>

        {/* Profile */}
        <NavLink
          to="/admin/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl no-underline transition text-sm font-medium ${
              isActive
                ? "text-blue-600 bg-blue-50 font-semibold"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`
          }
        >
          <FaUserCog className="text-base flex-shrink-0" />
          <span>Profile</span>
        </NavLink>

        {/* Logout */}
        <div
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition text-left text-gray-600 hover:bg-red-50 hover:text-red-600 cursor-pointer font-medium text-sm"
        >
          <FaSignOutAlt className="text-base flex-shrink-0" />
          <span>Logout</span>
        </div>
      </nav>
    </aside>
  );
}

export default AdminSidebar;