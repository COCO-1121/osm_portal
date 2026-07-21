import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";

function AdminTopbar({ title, subtitle }) {
  const navigate = useNavigate();
  const { admin } = useAdmin();

  return (
    <header className="min-h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 py-3">

      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {title}
        </h1>

        <p className="text-sm text-gray-500">
          {subtitle || "On Screen Marking Administration Portal"}
        </p>
      </div>

      <div
        onClick={() => navigate("/admin/profile")}
        className="flex items-center gap-4 cursor-pointer rounded-lg px-3 py-2 hover:bg-gray-100 transition"
      >
        <div className="text-right">
          <h2 className="font-semibold text-gray-800">
            {admin?.name}
          </h2>

          <p className="text-sm text-gray-500">
            {admin?.user_id}
          </p>
        </div>

        <div className="w-12 h-12 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-lg shadow">
          {admin?.name?.charAt(0).toUpperCase()}
        </div>
      </div>

    </header>
  );
}

export default AdminTopbar;