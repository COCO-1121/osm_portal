import { useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function RejectedTable({ scripts = [] }) {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [reasonFilter, setReasonFilter] = useState("All Reasons");

  // Convert backend status values into readable UI text
  const formatStatus = (status) => {
    const statusMap = {
      PENDING_ADMIN_REVIEW: "Pending",
      RETURNED_TO_UPLOADER: "Returned to Uploader",
      RETURNED_TO_EXAMINER: "Returned to Examiner",
    };

    return statusMap[status] || status;
  };

  // Convert backend rejection reason values into readable UI text
  const formatReason = (reason) => {
    if (!reason) return "N/A";

    return reason
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  // Get unique rejection reasons from real API data
  const rejectionReasons = useMemo(() => {
    return [
      ...new Set(
        scripts
          .map((script) => script.rejection_reason)
          .filter(Boolean)
      ),
    ];
  }, [scripts]);

  // Search and filter real API data
  const filteredScripts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return scripts.filter((script) => {
      const displayedStatus = formatStatus(script.status);

      const matchesSearch =
        !search ||
        script.barcode?.toLowerCase().includes(search) ||
        script.examiner_id?.toLowerCase().includes(search) ||
        script.centre_id?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        displayedStatus === statusFilter;

      const matchesReason =
        reasonFilter === "All Reasons" ||
        script.rejection_reason === reasonFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesReason
      );
    });
  }, [
    scripts,
    searchTerm,
    statusFilter,
    reasonFilter,
  ]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          Rejected Scripts
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Verify rejected scripts before returning them to the uploader.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        {/* Search */}
        <div className="flex items-center flex-1 bg-white border border-gray-300 rounded-lg px-3.5 py-2 w-full focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent transition shadow-sm">
          <FaSearch className="text-gray-400 text-sm flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by Barcode, Examiner ID or Centre ID..."
            className="w-full px-3 text-sm border-none outline-none bg-transparent text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Returned to Uploader">Returned to Uploader</option>
          <option value="Returned to Examiner">Returned to Examiner</option>
        </select>

        {/* Reject Reason Filter */}
        <select
          value={reasonFilter}
          onChange={(event) => setReasonFilter(event.target.value)}
          className="border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
        >
          <option value="All Reasons">All Reasons</option>
          {rejectionReasons.map((reason) => (
            <option key={reason} value={reason}>
              {formatReason(reason)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <th className="py-3.5 px-4">Barcode</th>
              <th className="py-3.5 px-4">Subject</th>
              <th className="py-3.5 px-4">Examiner ID</th>
              <th className="py-3.5 px-4">Centre ID</th>
              <th className="py-3.5 px-4">Reject Reason</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white text-sm">
            {filteredScripts.length > 0 ? (
              filteredScripts.map((item) => {
                const displayedStatus = formatStatus(item.status);

                return (
                  <tr
                    key={item.rejection_id}
                    className="hover:bg-gray-50/80 transition"
                  >
                    <td className="py-3.5 px-4 font-semibold text-gray-800">
                      {item.barcode}
                    </td>

                    <td className="py-3.5 px-4 text-gray-700 font-medium">
                      {item.subject}
                    </td>

                    <td className="py-3.5 px-4 text-gray-600 font-mono text-xs">
                      {item.examiner_id}
                    </td>

                    <td className="py-3.5 px-4 text-gray-600 font-mono text-xs">
                      {item.centre_id}
                    </td>

                    <td className="py-3.5 px-4 text-gray-700">
                      {formatReason(item.rejection_reason)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          displayedStatus === "Pending"
                            ? "bg-amber-100 text-amber-800"
                            : displayedStatus === "Returned to Uploader"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {displayedStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/admin/rejected-review/${item.rejection_id}`
                          )
                        }
                        className="bg-blue-700 hover:bg-blue-800 text-white font-medium px-4 py-1.5 rounded-lg text-xs shadow-sm transition duration-150 cursor-pointer"
                      >
                        {item.status === "PENDING_ADMIN_REVIEW"
                          ? "Review"
                          : "View"}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-12 text-gray-500 text-sm font-medium"
                >
                  No rejected scripts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RejectedTable;