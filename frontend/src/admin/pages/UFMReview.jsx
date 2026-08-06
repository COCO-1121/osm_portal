import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaExclamationTriangle,
  FaCheckCircle,
  FaUndo,
  FaTimes,
  FaFileAlt,
  FaUserCheck,
  FaBuilding,
  FaBarcode,
} from "react-icons/fa";
import AdminLayout from "../../shared/layouts/AdminLayout";
import PDFViewer from "../../examiner/components/PDFViewer";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function UFMReview() {
  const { ufmId } = useParams();
  const navigate = useNavigate();

  const [ufmCase, setUfmCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [adminRemarks, setAdminRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchUFMCase = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          throw new Error("Admin authentication token not found.");
        }

        const response = await fetch(
          `${API_URL}/api/v1/admin/ufm-cases/${ufmId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.detail || "Failed to load UFM case.");
        }

        const data = await response.json();
        setUfmCase(data);
      } catch (err) {
        console.error("UFM case fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (ufmId) {
      fetchUFMCase();
    }
  }, [ufmId]);

  const handleDecisionSubmit = async (decision, remarks = "") => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Admin authentication token not found.");
      }

      const response = await fetch(
        `${API_URL}/api/v1/admin/ufm-cases/${ufmId}/decision`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            decision: decision,
            remarks: remarks,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to submit decision.");
      }

      const result = await response.json();

      // Update local status
      setUfmCase((prev) => ({
        ...prev,
        status: result.status,
        review_decision: result.decision,
        admin_remarks: remarks,
        system_message:
          decision === "CONFIRM_UFM"
            ? "Paper cancelled. Marks = 0"
            : "UFM NOT FOUND. Continue Evaluation",
      }));

      setShowConfirmModal(false);
      setShowReturnModal(false);
      alert(
        decision === "CONFIRM_UFM"
          ? "UFM Confirmed. Student paper cancelled (Marks = 0)."
          : "Case returned to examiner for continued evaluation."
      );
    } catch (err) {
      console.error("Decision submit error:", err);
      alert(err.message || "Failed to submit UFM review decision.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING_ADMIN_REVIEW":
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Pending Review
          </span>
        );
      case "UFM_CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            UFM Confirmed
          </span>
        );
      case "RETURNED_TO_EXAMINER":
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Returned to Examiner
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Review UFM Case">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-sm text-gray-500">
          Loading UFM Case Details...
        </div>
      </AdminLayout>
    );
  }

  if (error || !ufmCase) {
    return (
      <AdminLayout title="Review UFM Case">
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-sm font-medium">
            {error || "UFM Case not found."}
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/ufm-cases")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
          >
            <FaArrowLeft /> Back to UFM Cases
          </button>
        </div>
      </AdminLayout>
    );
  }

  const isPending = ufmCase.status === "PENDING_ADMIN_REVIEW";

  return (
    <AdminLayout
      title="Review UFM Case"
      subtitle={`Case ID: ${ufmCase.ufm_id} | Barcode: ${ufmCase.barcode}`}
    >
      <div className="space-y-6">
        {/* Back Link & Header Banner */}
        <div className="flex justify-between items-center bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <button
            type="button"
            onClick={() => navigate("/admin/ufm-cases")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-700 text-sm font-semibold transition"
          >
            <FaArrowLeft /> Back to UFM Cases
          </button>
          <div>{getStatusBadge(ufmCase.status)}</div>
        </div>

        {/* Top Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Script Information Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <FaFileAlt className="text-blue-600 text-lg" />
              <h3 className="text-base font-bold text-gray-900">
                Script Information
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Barcode
                </p>
                <p className="font-mono font-bold text-blue-700 text-base mt-0.5 flex items-center gap-1.5">
                  <FaBarcode className="text-blue-500" />
                  {ufmCase.barcode}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </p>
                <p className="font-semibold text-gray-900 mt-0.5">
                  {ufmCase.subject}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Examiner ID
                </p>
                <p className="font-mono text-gray-700 mt-0.5 flex items-center gap-1.5">
                  <FaUserCheck className="text-gray-400" />
                  {ufmCase.examiner_id}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Centre ID
                </p>
                <p className="font-mono text-gray-700 mt-0.5 flex items-center gap-1.5">
                  <FaBuilding className="text-gray-400" />
                  {ufmCase.centre_id}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Examiner Report Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <FaExclamationTriangle className="text-amber-500 text-lg" />
              <h3 className="text-base font-bold text-gray-900">
                Examiner Report
              </h3>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UFM Reason
                </p>
                <span className="inline-block mt-1 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg font-bold text-xs">
                  {ufmCase.reason}
                </span>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Examiner Remarks
                </p>
                <div className="mt-1 bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-gray-800 text-sm italic">
                  "{ufmCase.examiner_remarks || "No additional remarks provided."}"
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Script Viewer */}
        <PDFViewer script={ufmCase} />

        {/* Admin Decision Panel */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              Review Decision
            </h2>
            <p className="text-sm text-gray-500">
              {isPending
                ? "Review examiner report and submit final decision for this UFM case."
                : "This UFM case has already been reviewed."}
            </p>
          </div>

          {isPending ? (
            <div className="space-y-4 pt-2">
              {/* Option 1: Return to Examiner */}
              <div
                onClick={() => setShowReturnModal(true)}
                className="border border-gray-200 hover:border-blue-500 hover:bg-blue-50/40 rounded-2xl p-5 transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 text-lg">
                  <FaUndo />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-gray-900">
                    Return to Examiner
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    UFM suspicion is invalid — return script to examiner for continued evaluation.
                  </p>
                </div>
                <button
                  type="button"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex-shrink-0 cursor-pointer"
                >
                  Return to Examiner
                </button>
              </div>

              {/* Option 2: Confirm UFM */}
              <div
                onClick={() => setShowConfirmModal(true)}
                className="border border-gray-200 hover:border-red-500 hover:bg-red-50/40 rounded-2xl p-5 transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0 text-lg">
                  <FaExclamationTriangle />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-gray-900">
                    Confirm UFM (Cancel Paper)
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    Confirm cheating malpractice — student paper cancelled, awarded 0 marks, and script locked.
                  </p>
                </div>
                <button
                  type="button"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex-shrink-0 cursor-pointer"
                >
                  Confirm UFM
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              {/* Final Status */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">
                  Final Status
                </p>
                <p className="font-semibold text-gray-800">
                  {ufmCase.status === "UFM_CONFIRMED"
                    ? "UFM Confirmed"
                    : ufmCase.status === "RETURNED_TO_EXAMINER"
                    ? "Returned to Examiner"
                    : ufmCase.status}
                </p>
              </div>

              {/* Admin Decision */}
              <div
                className={`border rounded-xl p-4 ${
                  ufmCase.review_decision === "CONFIRM_UFM" ||
                  ufmCase.status === "UFM_CONFIRMED"
                    ? "bg-red-50 border-red-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <p
                  className={`text-sm mb-1 ${
                    ufmCase.review_decision === "CONFIRM_UFM" ||
                    ufmCase.status === "UFM_CONFIRMED"
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                >
                  Admin Decision
                </p>
                <p
                  className={`font-semibold ${
                    ufmCase.review_decision === "CONFIRM_UFM" ||
                    ufmCase.status === "UFM_CONFIRMED"
                      ? "text-red-800"
                      : "text-blue-800"
                  }`}
                >
                  {ufmCase.review_decision === "CONFIRM_UFM" ||
                  ufmCase.status === "UFM_CONFIRMED"
                    ? "Confirm UFM (Paper Cancelled, Marks = 0)"
                    : "Return to Examiner"}
                </p>
              </div>

              {/* System Message */}
              {ufmCase.system_message && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-sm text-green-600 mb-1">
                    System Message
                  </p>
                  <div className="flex items-start gap-2 text-green-800">
                    <FaCheckCircle className="mt-1 flex-shrink-0 text-green-600" />
                    <p className="font-medium">
                      {ufmCase.system_message}
                    </p>
                  </div>
                </div>
              )}

              {/* Admin Remarks */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">
                  Admin Remarks
                </p>
                <p className="font-medium text-gray-800 whitespace-pre-wrap">
                  {ufmCase.admin_remarks ||
                    "No additional remarks provided."}
                </p>
              </div>

              {/* Reviewed At */}
              {ufmCase.reviewed_at && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">
                    Reviewed At
                  </p>
                  <p className="font-medium text-gray-800">
                    {new Date(ufmCase.reviewed_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── MODAL 1: Confirm UFM Confirmation Dialog ── */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
              <div className="flex justify-between items-center border-b border-gray-100 p-5 bg-red-50/50">
                <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
                  <FaExclamationTriangle />
                  Confirm UFM
                </h3>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6 space-y-4 text-sm text-gray-700">
                <p className="font-medium text-gray-900">
                  The student's answer script will be cancelled.
                </p>

                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider">
                    Penalty Enforced
                  </p>
                  <p className="text-2xl font-black text-red-700 mt-1">
                    Marks Awarded : 0
                  </p>
                </div>

                <p className="text-xs text-red-600 font-semibold text-center">
                  This action cannot be undone.
                </p>

                <div className="flex gap-3 pt-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(false)}
                    disabled={actionLoading}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleDecisionSubmit("CONFIRM_UFM")}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition shadow-sm cursor-pointer"
                  >
                    {actionLoading ? "Processing..." : "Confirm"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL 2: Return to Examiner Modal ── */}
        {showReturnModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
              <div className="flex justify-between items-center border-b border-gray-100 p-5 bg-blue-50/50">
                <h3 className="text-lg font-bold text-blue-700 flex items-center gap-2">
                  <FaUndo />
                  Return to Examiner
                </h3>
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6 space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Additional Remarks (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={adminRemarks}
                    onChange={(e) => setAdminRemarks(e.target.value)}
                    placeholder="Provide any instructions or reasoning for the examiner..."
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* System message box - always visible on return to examiner */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-blue-900 font-bold text-xs tracking-wide">
                  UFM NOT FOUND. Continue Evaluation
                </div>

                <div className="flex gap-3 pt-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowReturnModal(false)}
                    disabled={actionLoading}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() =>
                      handleDecisionSubmit("RETURN_TO_EXAMINER", adminRemarks)
                    }
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-sm cursor-pointer"
                  >
                    {actionLoading ? "Submitting..." : "Return"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default UFMReview;
