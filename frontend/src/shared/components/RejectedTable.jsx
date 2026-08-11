import { useMemo, useState } from "react";
import { FaSearch, FaCalendarAlt, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const STANDARD_REJECTION_REASONS = [
  "Improper Scanning",
  "Answer Book of different Subject",
  "Medium of Answer Book is different",
  "Missing Pages",
  "Same page Scan twice",
  "Illegible Handwriting / Blurred Image",
  "Others",
];

function formatReason(reason) {
  if (!reason) return "N/A";
  let r = reason
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
  if (r === "Missing Page") return "Missing Pages";
  return r;
}

function matchesRejectionReason(scriptReason = "", selectedFilter = "") {
  if (!selectedFilter || selectedFilter === "All Reasons") return true;

  const scriptNorm = formatReason(scriptReason).toLowerCase().trim();
  const selNorm = selectedFilter.toLowerCase().trim();

  if (scriptNorm === selNorm) return true;

  // Smart merge: "missing page" / "missing pages"
  if (
    selNorm.includes("missing page") &&
    scriptNorm.includes("missing page")
  ) {
    return true;
  }

  // Smart merge: "illegible handwriting" / "blurred image"
  if (selNorm.includes("illegible") || selNorm.includes("blurred")) {
    if (
      scriptNorm.includes("illegible") ||
      scriptNorm.includes("blurred") ||
      scriptNorm.includes("handwriting")
    ) {
      return true;
    }
  }

  // Smart merge: "different subject"
  if (selNorm.includes("subject") && scriptNorm.includes("subject")) {
    return true;
  }

  // Substring fallback
  return scriptNorm.includes(selNorm) || selNorm.includes(scriptNorm);
}

function RejectedTable({ scripts = [] }) {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [reasonFilter, setReasonFilter] = useState("All Reasons");
  const [dateFilter, setDateFilter] = useState("");

  // Convert backend status values into readable UI text
  const formatStatus = (status) => {
    const statusMap = {
      PENDING_ADMIN_REVIEW: "Pending",
      RETURNED_TO_UPLOADER: "Returned to Uploader",
      RETURNED_TO_EXAMINER: "Returned to Examiner",
    };

    return statusMap[status] || status;
  };

  // Smart merged list of rejection reasons for dropdown
  const rejectionReasonsList = useMemo(() => {
    const list = [...STANDARD_REJECTION_REASONS];
    scripts.forEach((s) => {
      if (s.rejection_reason) {
        const formatted = formatReason(s.rejection_reason);
        const alreadyCovered = list.some(
          (r) =>
            r.toLowerCase().trim() === formatted.toLowerCase().trim() ||
            matchesRejectionReason(s.rejection_reason, r)
        );
        if (!alreadyCovered) {
          list.push(formatted);
        }
      }
    });
    return list;
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
        script.centre_id?.toLowerCase().includes(search) ||
        script.subject?.toLowerCase().includes(search) ||
        formatReason(script.rejection_reason).toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All" || displayedStatus === statusFilter;

      const matchesReason = matchesRejectionReason(
        script.rejection_reason,
        reasonFilter
      );

      const matchesDate = (() => {
        if (!dateFilter) return true;
        if (!script.rejected_at) return false;
        const isoDate = new Date(script.rejected_at).toISOString().slice(0, 10);
        const localDate = new Date(script.rejected_at).toLocaleDateString("en-CA");
        return (
          isoDate === dateFilter ||
          localDate === dateFilter ||
          String(script.rejected_at).startsWith(dateFilter)
        );
      })();

      return matchesSearch && matchesStatus && matchesReason && matchesDate;
    });
  }, [scripts, searchTerm, statusFilter, reasonFilter, dateFilter]);

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
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search */}
        <div className="flex items-center flex-1 min-w-[240px] bg-gray-50/80 border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-blue-600 focus-within:bg-white transition shadow-xs">
          <FaSearch className="text-gray-400 text-sm flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by Barcode, Examiner ID or Centre ID..."
            className="w-full px-3 text-sm border-none outline-none bg-transparent text-gray-800 placeholder-gray-400"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <FaTimes className="text-xs" />
            </button>
          )}
        </div>

        {/* Dropdowns & Clean Date Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm bg-white text-gray-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer font-medium"
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
            className="border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm bg-white text-gray-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer max-w-[220px] truncate font-medium"
          >
            <option value="All Reasons">All Reasons</option>
            {rejectionReasonsList.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>

          {/* Clean Date Filter Button */}
          <div className="relative">
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              title="Filter by Rejected Date"
            />
            <div
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition shadow-xs whitespace-nowrap ${
                dateFilter
                  ? "bg-blue-50 text-blue-700 border-blue-400 font-semibold"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
              }`}
            >
              <FaCalendarAlt className={dateFilter ? "text-blue-600 text-xs" : "text-gray-400 text-xs"} />
              <span>
                {dateFilter
                  ? new Date(dateFilter + "T00:00:00").toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "Filter Date"}
              </span>
              {dateFilter && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDateFilter("");
                  }}
                  className="z-20 ml-1 text-blue-500 hover:text-blue-700 p-0.5"
                  title="Clear date"
                >
                  <FaTimes className="text-xs" />
                </button>
              )}
            </div>
          </div>
        </div>
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
              <th className="py-3.5 px-4">Rejected Date</th>
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

                    <td className="py-3.5 px-4 text-gray-600 text-xs font-medium whitespace-nowrap">
                      {item.rejected_at
                        ? new Date(item.rejected_at).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "N/A"}
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
                  colSpan="8"
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