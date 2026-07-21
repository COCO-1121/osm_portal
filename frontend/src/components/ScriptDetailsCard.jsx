function ScriptDetailsCard({ script }) {
  const formatStatus = (status) => {
    const statusMap = {
      PENDING_ADMIN_REVIEW: "Pending",
      RETURNED_TO_UPLOADER: "Returned to Uploader",
      RETURNED_TO_EXAMINER: "Returned to Examiner",
    };

    return statusMap[status] || status || "N/A";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    if (status === "PENDING_ADMIN_REVIEW") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (status === "RETURNED_TO_UPLOADER") {
      return "bg-green-100 text-green-700";
    }

    if (status === "RETURNED_TO_EXAMINER") {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Script Details
      </h2>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-500">Barcode</p>
          <p className="font-semibold">
            {script?.barcode || "N/A"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Subject</p>
          <p className="font-semibold">
            {script?.subject || "N/A"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Examiner ID</p>
          <p className="font-semibold">
            {script?.examiner_id || "N/A"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Centre ID</p>
          <p className="font-semibold">
            {script?.centre_id || "N/A"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Rejected Date</p>
          <p className="font-semibold">
            {formatDate(script?.rejected_at)}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">
            Current Status
          </p>

          <span
            className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusStyle(
              script?.status
            )}`}
          >
            {formatStatus(script?.status)}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm text-gray-500">
          Reject Reason
        </p>

        <div className="mt-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {script?.rejection_reason || "No rejection reason provided."}
        </div>
      </div>

      {script?.examiner_remarks && (
        <div className="mt-6">
          <p className="text-sm text-gray-500">
            Examiner Remarks
          </p>

          <div className="mt-2 p-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-700">
            {script.examiner_remarks}
          </div>
        </div>
      )}
    </div>
  );
}

export default ScriptDetailsCard;