import {
  FaChartPie,
  FaFileAlt,
  FaKey,
  FaSignOutAlt,
  FaHome,
} from "react-icons/fa";

import { NavLink, useNavigate } from "react-router-dom";

function AdminSidebar() {

  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (confirmLogout) {
      navigate("/admin-login");
    }
  };

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-200">

      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-blue-700">
          Admin Panel
        </h2>
      </div>

      <nav className="mt-6">

        <div
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-100 transition text-left text-gray-700 cursor-pointer bg-transparent border-none"
        >
          <FaHome />
          Home
        </div>

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
          Dashboard
        </NavLink>

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
          Rejected Scripts
        </NavLink>

        <NavLink
          to="/admin/credential-management"
          className={({ isActive }) =>
            `flex items-center gap-3 px-6 py-4 no-underline transition ${
              isActive
                ? "text-blue-700 bg-blue-50 border-r-4 border-blue-700 font-medium"
                : "hover:bg-gray-100 text-gray-700"
            }`
          }
        >
          <FaKey />
          Credential Management
        </NavLink>

        <div
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-6 py-4 hover:bg-red-50 hover:text-red-600 transition text-left text-gray-700 cursor-pointer bg-transparent border-none"
        >
          <FaSignOutAlt />
          Logout
        </div>

      </nav>

    </aside>
  );
}

export default AdminSidebar;