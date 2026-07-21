import { FaShieldAlt, FaQuestionCircle, FaCog, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("examinerData");
      navigate("/examiner-login");
    }
  };

  return (
    <nav className="h-16 border-b bg-white flex justify-between items-center px-8">

      {/* Left Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <FaShieldAlt className="text-blue-700 text-lg" />
        </div>

        <h1 className="text-2xl font-bold text-slate-800">
          OSM Portal
        </h1>
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-6">

        <button 
          className="text-gray-500 hover:text-blue-700 transition duration-200"
          onClick={() => navigate("/instruction")}
          title="Help & Instructions"
        >
          <FaQuestionCircle size={28} />
        </button>

        <button 
          className="text-gray-500 hover:text-red-600 transition duration-200"
          onClick={handleLogout}
          title="Logout"
        >
          <FaSignOutAlt size={28} />
        </button>

      </div>

    </nav>
  );
}

export default Navbar;