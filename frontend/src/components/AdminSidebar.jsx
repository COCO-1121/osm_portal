import {
  FaChartPie,
  FaFileAlt,
  FaSignOutAlt,
  FaHome,
  FaUsers,
  FaHistory,
  FaUserCog,
} from "react-icons/fa";

import { NavLink, useNavigate } from "react-router-dom";

function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (confirmLogout) {
      // Clear admin authentication data
      localStorage.removeItem("access_token");
      localStorage.removeItem("token_type");
      localStorage.removeItem("admin_user");

      // Redirect to admin login
      navigate("/admin-login", { replace: true });
    }
  };

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-200">
      {/* Admin Panel Heading */}
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-blue-700">
          Admin Panel
        </h2>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        {/* Home */}
        <div
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-100 transition text-left text-gray-700 cursor-pointer bg-transparent border-none"
        >
          <FaHome />
          <span>Home</span>
        </div>

        {/* Dashboard */}
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-6 py-4 no-underline transition ${
              isActive
                ? "text-blue-700 bg-blue-50 border-r-4 border-blue-700 font-medium"
                : "hover:bg-gray-100 text-gray-700"
            }`
          }
        >
          <FaChartPie />
          <span>Dashboard</span>
        </NavLink>

        {/* Rejected Scripts */}
        <NavLink
          to="/admin/rejected-scripts"
          className={({ isActive }) =>
            `flex items-center gap-3 px-6 py-4 no-underline transition ${
              isActive
                ? "text-blue-700 bg-blue-50 border-r-4 border-blue-700 font-medium"
                : "hover:bg-gray-100 text-gray-700"
            }`
          }
        >
          <FaFileAlt />
          <span>Rejected Scripts</span>
        </NavLink>

        <NavLink
  to="/admin/examiners"
  className={({ isActive }) =>
    `flex items-center gap-3 px-6 py-4 no-underline transition ${
      isActive
        ? "text-blue-700 bg-blue-50 border-r-4 border-blue-700 font-medium"
        : "hover:bg-gray-100 text-gray-700"
    }`
  }
>
  <FaUsers />
  <span>Examiner Management</span>
</NavLink>

        {/* Audit Logs */}
        <NavLink
          to="/admin/audit-logs"
          className={({ isActive }) =>
            `flex items-center gap-3 px-6 py-4 no-underline transition ${
              isActive
                ? "text-blue-700 bg-blue-50 border-r-4 border-blue-700 font-medium"
                : "hover:bg-gray-100 text-gray-700"
            }`
          }
        >
          <FaHistory />
          <span>Audit Logs</span>
        </NavLink>

        {/* Admin Profile */}
        <NavLink
          to="/admin/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-6 py-4 no-underline transition ${
              isActive
                ? "text-blue-700 bg-blue-50 border-r-4 border-blue-700 font-medium"
                : "hover:bg-gray-100 text-gray-700"
            }`
          }
        >
          <FaUserCog />
          <span>Profile</span>
        </NavLink>

        {/* Logout */}
        <div
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-6 py-4 hover:bg-red-50 hover:text-red-600 transition text-left text-gray-700 cursor-pointer bg-transparent border-none"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </div>
      </nav>
    </aside>
  );
}

export default AdminSidebar;