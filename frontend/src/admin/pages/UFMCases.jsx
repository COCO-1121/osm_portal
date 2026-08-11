import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaExclamationTriangle, FaEye, FaChevronDown, FaCalendarAlt, FaTimes } from "react-icons/fa";
import AdminLayout from "../../shared/layouts/AdminLayout";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const UFM_REASONS = [
  "Writing Roll No./Reg. No./Religious Symbol/Prayer/Appeal",
  "Seeking Sympathy Or Other Distinguishing Marks",
  "Writing Any Extraneous Irrelevant Unwanted Not/Remarks/Mobile No.",
  "Writing In A Colour Other Than Blue Or Black",
  "Writing In Different Handwritings",
  "Tearing Or Carrying Of Page",
  "Abusive Language Or Remarks",
  "Put Signatures",
  "Others",
];

function checkReasonMatch(itemReason = "", selectedReason = "") {
  if (!selectedReason || selectedReason === "ALL") return true;

  const itemNorm = itemReason.toLowerCase().trim();
  const selNorm = selectedReason.toLowerCase().trim();

  // 1. Exact match
  if (itemNorm === selNorm) return true;

  // 2. Substring match either way
  if (itemNorm.includes(selNorm) || selNorm.includes(itemNorm)) return true;

  // 3. Keyword / Category aliases mapping
  const KEYWORD_MAP = {
    "writing in different handwritings": [
      "handwriting",
      "handwritings",
      "mismatch",
      "writing",
    ],
    "writing roll no./reg. no./religious symbol/prayer/appeal": [
      "roll",
      "reg",
      "religious",
      "symbol",
      "prayer",
      "appeal",
      "copying",
      "copied",
    ],
    "writing any extraneous irrelevant unwanted not/remarks/mobile no.": [
      "extraneous",
      "mobile",
      "phone",
      "cheat",
      "unauthorized",
      "unwanted",
      "remarks",
    ],
    "seeking sympathy or other distinguishing marks": [
      "sympathy",
      "distinguishing",
      "marks",
    ],
    "writing in a colour other than blue or black": [
      "colour",
      "color",
      "blue",
      "black",
      "ink",
      "red",
      "green",
    ],
    "tearing or carrying of page": ["tearing", "torn", "carrying", "page"],
    "abusive language or remarks": ["abusive", "language", "profanity", "swear"],
    "put signatures": ["signature", "signatures", "sign"],
  };

  const keywords = KEYWORD_MAP[selNorm];
  if (keywords && keywords.some((kw) => itemNorm.includes(kw))) {
    return true;
  }

  // 4. Token overlap matching
  const selTokens = selNorm.split(/[\s/.,()]+/).filter((t) => t.length >= 4);
  const itemTokens = itemNorm.split(/[\s/.,()]+/).filter((t) => t.length >= 4);

  return selTokens.some((t) =>
    itemTokens.some((it) => it.includes(t) || t.includes(it))
  );
}

function UFMCases() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedReason, setSelectedReason] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    const fetchUFMCases = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          throw new Error("Admin authentication token not found.");
        }

        const response = await fetch(`${API_URL}/api/v1/admin/ufm-cases`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.detail || "Failed to fetch UFM cases."
          );
        }

        const data = await response.json();
        setCases(data);
      } catch (err) {
        console.error("UFM cases fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUFMCases();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING_ADMIN_REVIEW":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Pending Review
          </span>
        );
      case "UFM_CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            UFM Confirmed
          </span>
        );
      case "RETURNED_TO_EXAMINER":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Returned to Examiner
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  const filteredCases = cases.filter((item) => {
    const matchesStatus =
      selectedStatus === "ALL" || item.status === selectedStatus;

    const matchesReason = checkReasonMatch(item.reason, selectedReason);

    const matchesDate = (() => {
      if (!dateFilter) return true;
      if (!item.reported_at) return false;
      const isoDate = new Date(item.reported_at).toISOString().slice(0, 10);
      const localDate = new Date(item.reported_at).toLocaleDateString("en-CA");
      return isoDate === dateFilter || localDate === dateFilter || String(item.reported_at).startsWith(dateFilter);
    })();

    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.barcode.toLowerCase().includes(q) ||
      item.subject.toLowerCase().includes(q) ||
      item.examiner_id.toLowerCase().includes(q) ||
      item.centre_id.toLowerCase().includes(q) ||
      item.reason.toLowerCase().includes(q) ||
      (item.examiner_remarks &&
        item.examiner_remarks.toLowerCase().includes(q));

    return matchesStatus && matchesReason && matchesDate && matchesSearch;
  });

  return (
    <AdminLayout
      title="UFM Cases"
      subtitle="Review and process suspected unfair means cases reported by examiners."
    >
      <div className="space-y-6">
        {/* Controls Section */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center">
          {/* Search Box - Flex 1 */}
          <div className="relative flex-1 min-w-[240px]">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
            <input
              type="text"
              placeholder="Search Barcode, Subject, Examiner ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <FaTimes className="text-xs" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns & Date Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Dropdown */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none bg-white border border-gray-300 hover:border-gray-400 text-gray-800 text-sm font-medium rounded-xl px-4 py-2.5 pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-xs"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING_ADMIN_REVIEW">Pending Review</option>
                <option value="UFM_CONFIRMED">UFM Confirmed</option>
                <option value="RETURNED_TO_EXAMINER">Returned to Examiner</option>
              </select>
              <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            </div>

            {/* Reason Dropdown */}
            <div className="relative">
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="appearance-none bg-white border border-gray-300 hover:border-gray-400 text-gray-800 text-sm font-medium rounded-xl px-4 py-2.5 pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-xs max-w-[220px] truncate"
              >
                <option value="ALL">All Reasons</option>
                {UFM_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            </div>

            {/* Clean Date Filter Button */}
            <div className="relative">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                title="Filter by UFM Raised Date"
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

        {/* Loading / Error States */}
        {loading && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-sm text-gray-500 font-medium">
            Loading UFM cases...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Table View */}
        {!loading && !error && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {filteredCases.length === 0 ? (
              <div className="p-12 text-center text-gray-500 space-y-3">
                <FaExclamationTriangle className="text-3xl text-gray-300 mx-auto" />
                <p className="font-medium text-base">No UFM cases found.</p>
                <p className="text-xs text-gray-400">
                  Try adjusting your filter or search query.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Barcode</th>
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Examiner ID</th>
                      <th className="px-6 py-4">Centre ID</th>
                      <th className="px-6 py-4">UFM Reason</th>
                      <th className="px-6 py-4">UFM Raised Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {filteredCases.map((item) => (
                      <tr
                        key={item.ufm_id}
                        className="hover:bg-blue-50/40 transition duration-150"
                      >
                        <td className="px-6 py-4 font-mono font-bold text-blue-700">
                          {item.barcode}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {item.subject}
                        </td>
                        <td className="px-6 py-4 font-mono text-gray-600">
                          {item.examiner_id}
                        </td>
                        <td className="px-6 py-4 font-mono text-gray-600">
                          {item.centre_id}
                        </td>
                        <td className="px-6 py-4 text-gray-800 font-medium">
                          {item.reason}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-xs font-medium whitespace-nowrap">
                          {item.reported_at
                            ? new Date(item.reported_at).toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/admin/ufm-review/${item.ufm_id}`)
                            }
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-sm"
                          >
                            <FaEye className="text-xs" />
                            {item.status === "PENDING_ADMIN_REVIEW"
                              ? "Review"
                              : "View"}
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
      </div>
    </AdminLayout>
  );
}

export default UFMCases;
