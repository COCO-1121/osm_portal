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
    <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Rejected Scripts
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Verify rejected scripts before returning them to the uploader.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Search */}
        <div className="flex items-center flex-1 border border-gray-300 rounded-lg px-4">
          <FaSearch className="text-gray-400" />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Search by Barcode, Examiner ID or Centre ID..."
            className="w-full px-3 py-3 outline-none text-sm"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          className="border border-gray-300 rounded-lg px-4 py-3 text-sm"
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Returned to Uploader">
            Returned to Uploader
          </option>
          <option value="Returned to Examiner">
            Returned to Examiner
          </option>
        </select>

        {/* Reject Reason Filter */}
        <select
          value={reasonFilter}
          onChange={(event) =>
            setReasonFilter(event.target.value)
          }
          className="border border-gray-300 rounded-lg px-4 py-3 text-sm"
        >
          <option value="All Reasons">
            All Reasons
          </option>

          {rejectionReasons.map((reason) => (
            <option
              key={reason}
              value={reason}
            >
              {formatReason(reason)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-4 font-semibold">
                Barcode
              </th>

              <th className="text-left font-semibold">
                Subject
              </th>

              <th className="text-left font-semibold">
                Examiner ID
              </th>

              <th className="text-left font-semibold">
                Centre ID
              </th>

              <th className="text-left font-semibold">
                Reject Reason
              </th>

              <th className="text-left font-semibold">
                Status
              </th>

              <th className="text-center font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredScripts.length > 0 ? (
              filteredScripts.map((item) => {
                const displayedStatus = formatStatus(
                  item.status
                );

                return (
                  <tr
                    key={item.rejection_id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-4">
                      {item.barcode}
                    </td>

                    <td>
                      {item.subject}
                    </td>

                    <td>
                      {item.examiner_id}
                    </td>

                    <td>
                      {item.centre_id}
                    </td>

                    <td>
                      {formatReason(
                        item.rejection_reason
                      )}
                    </td>

                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          displayedStatus === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : displayedStatus ===
                              "Returned to Uploader"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {displayedStatus}
                      </span>
                    </td>

                    <td className="text-center">
                      <button
                        onClick={() =>
                          navigate(
                            `/admin/rejected-review/${item.rejection_id}`
                          )
                        }
                        className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg transition duration-200 shadow-sm hover:shadow-md"
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
                  className="text-center py-10 text-gray-500"
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