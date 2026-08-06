import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaEye, FaTimes, FaUpload, FaHome, FaHistory, FaQuestionCircle, FaSignOutAlt, FaTimesCircle } from "react-icons/fa";
import apiClient from "../../shared/services/apiClient";

function RejectedQueue() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterReason, setFilterReason] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [rejectedData, setRejectedData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRejectedQueue = async () => {
      try {
        const response = await apiClient.get("/examiner/rejected-queue");
        if (response.data && Array.isArray(response.data)) {
          setRejectedData(response.data);
        } else {
          const stored = localStorage.getItem("examiner_rejected_scripts");
          setRejectedData(stored ? JSON.parse(stored) : []);
        }
      } catch (err) {
        const stored = localStorage.getItem("examiner_rejected_scripts");
        setRejectedData(stored ? JSON.parse(stored) : []);
      } finally {
        setLoading(false);
      }
    };

    fetchRejectedQueue();
  }, []);

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      navigate("/examiner/login");
    }
  };

  const reasons = [...new Set(rejectedData.map((item) => item.reason || item.adminRemarks || "Other"))];

  const filteredData = rejectedData.filter((item) => {
    const barcodeStr = item.barcode || "";
    const subjectStr = item.subject || "";
    const matchesSearch =
      barcodeStr.toLowerCase().includes(search.toLowerCase()) ||
      subjectStr.toLowerCase().includes(search.toLowerCase());
    const itemReason = item.reason || item.adminRemarks || "Other";
    const matchesReason = filterReason ? itemReason === filterReason : true;
    return matchesSearch && matchesReason;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 px-6 py-5">
            <span className="text-xl font-bold text-gray-800">OSM Portal</span>
          </div>

          <nav className="mt-4 flex flex-col gap-1 px-3">
            <a onClick={() => navigate("/examiner/dashboard")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium cursor-pointer">
              <FaHome /> Home
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-100 text-gray-900 text-sm font-semibold">
              <FaTimesCircle /> Rejected Queue
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium cursor-pointer" onClick={() => navigate("/examiner/day-wise-report")}>
              <FaHistory /> History
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium cursor-pointer" onClick={() => navigate("/examiner/instructions")}>
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
          <div className="relative w-96">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Barcode or Subject"
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-gray-100 border border-gray-200 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">Academic Examiner</p>
              <p className="text-xs text-gray-500">ID: EX001</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
              EP
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-8 flex-1">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Rejected Queue</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage and rectify scripts with automated or manual rejection flags.
              </p>
            </div>

            <select
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
            >
              <option value="">Filter by Reason</option>
              {reasons.map((reason) => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold">Barcode</th>
                  <th className="text-left px-6 py-3 font-semibold">Subject</th>
                  <th className="text-left px-6 py-3 font-semibold">Reason for Rejection</th>
                  <th className="text-left px-6 py-3 font-semibold">Preview Copy</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.barcode} className="border-t border-gray-100">
                    <td className="px-6 py-4 text-gray-700 font-medium">{item.barcode}</td>
                    <td className="px-6 py-4 text-gray-700">{item.subject}</td>
                    <td className="px-6 py-4">
                      <span className="bg-red-50 text-red-600 text-xs font-medium px-3 py-1 rounded-full">
                        {item.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="flex items-center gap-1 text-blue-600 font-medium hover:underline"
                      >
                        <FaEye /> Open
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                      No results found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="px-6 py-4 text-xs text-gray-500">
              Showing {filteredData.length} of {rejectedData.length} rejected scripts
            </div>
          </div>

        </main>
      </div>

      {/* Dialog / Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedItem.barcode}</h2>
                <p className="text-sm text-gray-500">{selectedItem.subject}</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-gray-100 border border-gray-200 rounded-lg h-96 flex items-center justify-center text-gray-400 text-sm">
                PDF preview will appear here
              </div>

              <p className="mt-4 text-sm text-gray-600">
                Rejection reason:{" "}
                <span className="text-red-600 font-medium">{selectedItem.reason}</span>
              </p>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
                <FaUpload /> Re-upload
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default RejectedQueue;
