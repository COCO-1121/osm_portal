import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaSignOutAlt,
  FaHistory,
  FaQuestionCircle,
  FaExclamationCircle,
  FaEye,
  FaRedo,
  FaFileAlt
} from "react-icons/fa";

function RejectedQueue() {
  const navigate = useNavigate();
  const [rejectedDocs, setRejectedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRejectedQueue = useCallback(async () => {
    const token = localStorage.getItem("uploader_token");
    if (!token) {
      setError("Please login again.");
      navigate("/uploader-login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // First try /api/rejected-queue/ backend endpoint
      let response = await fetch("/api/rejected-queue/", {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          Accept: "application/json",
        },
      });

      // Fallback to /api/scanned-documents/ if needed
      if (!response.ok) {
        response = await fetch("/api/scanned-documents/", {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
            Accept: "application/json",
          },
        });
      }

      if (response.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem("uploader_token");
        localStorage.removeItem("uploader_id");
        navigate("/uploader-login");
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch rejected queue (Status ${response.status})`);
      }

      const data = await response.json();
      let list = Array.isArray(data) ? data : data.documents || [];
      // Ensure only rejected items are shown if coming from /api/scanned-documents/
      list = list.filter((doc) => doc.status === "Rejected" || doc.status === "rejected");
      setRejectedDocs(list);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to load rejected queue.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchRejectedQueue();
  }, [fetchRejectedQueue]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("uploader_token");
      localStorage.removeItem("uploader_id");
      navigate("/uploader-login");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Uploader Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
        <div>
          <div className="px-6 py-6">
            <span className="text-2xl font-bold text-gray-900">OSM Portal</span>
          </div>

          <nav className="mt-2 flex flex-col gap-1 px-3">
            <a
              onClick={() => navigate("/uploader/dashboard")}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-100 text-[15px] font-medium cursor-pointer"
            >
              <FaHome className="text-[17px]" />
              <span>Home</span>
            </a>

            <a className="flex items-center gap-3 px-3 py-3 rounded-lg bg-blue-50 text-blue-700 text-[15px] font-semibold cursor-pointer">
              <FaExclamationCircle className="text-[17px]" />
              <span>Rejected Queue</span>
            </a>

            <a
              onClick={() => navigate("/uploader/uploaded-copies")}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-100 text-[15px] font-medium cursor-pointer"
            >
              <FaHistory className="text-[17px]" />
              <span>History</span>
            </a>

            <a className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-100 text-[15px] font-medium cursor-pointer">
              <FaQuestionCircle className="text-[17px]" />
              <span>Support</span>
            </a>
          </nav>
        </div>

        <div className="px-3 pb-6">
          <a
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-red-500 hover:bg-red-50 text-[15px] font-medium cursor-pointer"
          >
            <FaSignOutAlt className="text-[17px]" />
            <span>Logout</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="flex items-center justify-between bg-white border-b border-gray-200 px-8 py-5">
          <h2 className="text-2xl font-bold text-gray-800">On-Screen Marking System</h2>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">Uploader</p>
              <p className="text-xs text-gray-500">Rejected Queue</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
              UP
            </div>
          </div>
        </header>

        {/* Body Content */}
        <main className="p-8 flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Uploader Rejected Queue</h1>
              <p className="text-sm text-gray-500 mt-1">
                Scanned documents that require review or re-scanning.
              </p>
            </div>
            <button
              onClick={fetchRejectedQueue}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FaRedo className="text-xs" /> Refresh
            </button>
          </div>

          {loading && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
              Loading rejected documents...
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {rejectedDocs.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <FaFileAlt className="mx-auto text-4xl text-gray-300 mb-3" />
                  <p className="text-base font-semibold text-gray-700">No Rejected Items</p>
                  <p className="text-sm text-gray-500 mt-1">
                    There are currently no answer sheets in the rejected queue.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Document ID / Barcode</th>
                        <th className="px-6 py-4">Filename</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Upload Time</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {rejectedDocs.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 font-mono font-medium text-gray-900">
                            {doc.barcode || `DOC-${doc.id}`}
                          </td>
                          <td className="px-6 py-4 text-gray-800">
                            {doc.filename || doc.original_filename || "scanned_copy.pdf"}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                              Rejected
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {doc.upload_time
                              ? new Date(doc.upload_time).toLocaleString()
                              : doc.created_at
                              ? new Date(doc.created_at).toLocaleString()
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => navigate(`/uploader/preview/${doc.id}`)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md font-medium text-xs transition"
                            >
                              <FaEye /> View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default RejectedQueue;
