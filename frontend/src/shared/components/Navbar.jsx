import { FaShieldAlt, FaQuestionCircle, FaCog, FaArrowLeft } from "react-icons/fa";

function Navbar({ onBack }) {
  return (
    <nav className="h-16 border-b bg-white flex justify-between items-center px-8">

      {/* Left Logo & Back Navigation */}
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 transition cursor-pointer flex items-center justify-center"
            title="Back to Portal Selection"
          >
            <FaArrowLeft className="text-sm" />
          </button>
        )}

        {onBack && <div className="h-5 w-px bg-slate-200"></div>}

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <FaShieldAlt className="text-blue-700 text-lg" />
          </div>

          <h1 className="text-2xl font-bold text-slate-800">
            OSM Portal
          </h1>
        </div>
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