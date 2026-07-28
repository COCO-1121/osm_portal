import { FaShieldAlt, FaQuestionCircle, FaCog } from "react-icons/fa";

function Navbar() {
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

        <button className="text-gray-500 hover:text-blue-700 transition duration-200">
          <FaQuestionCircle size={28} />
        </button>

        <button className="text-gray-500 hover:text-blue-700 transition duration-200">
          <FaCog size={28} />
        </button>

      </div>

    </nav>
  );
}

export default Navbar;