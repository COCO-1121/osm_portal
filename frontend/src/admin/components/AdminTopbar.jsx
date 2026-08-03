import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";

function AdminTopbar({ title, subtitle }) {
  const navigate = useNavigate();
  const { admin } = useAdmin();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
      <div>
        <h1 className="text-xl font-bold text-gray-900 leading-tight">
          {title}
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          {subtitle || "On Screen Marking Administration Portal"}
        </p>
      </div>

      <div
        onClick={() => navigate("/admin/profile")}
        className="flex items-center gap-3 cursor-pointer rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition"
      >
        <div className="text-right">
          <h2 className="text-sm font-semibold text-gray-800 leading-tight">
            {admin?.name || "Admin User"}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {admin?.user_id || "ADM001"}
          </p>
        </div>

        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
          {admin?.name?.charAt(0).toUpperCase() || "A"}
        </div>
      </div>
    </header>
  );
}

export default AdminTopbar;