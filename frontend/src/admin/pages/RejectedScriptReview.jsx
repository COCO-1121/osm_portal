import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

import AdminLayout from "../../shared/layouts/AdminLayout";
import ScriptDetailsCard from "../../admin/components/ScriptDetailsCard";
import PDFViewer from "../../examiner/components/PDFViewer";
import ReviewActions from "../../admin/components/ReviewActions";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function RejectedScriptReview() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const rejectionId = params.rejectionId || searchParams.get("rejectionId") || searchParams.get("id");

  const [script, setScript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/admin/rejected-scripts");
    }
  };

  useEffect(() => {
    const fetchRejectedScript = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          throw new Error(
            "Authentication token not found. Please login again."
          );
        }

        const response = await fetch(
          `${API_URL}/api/v1/admin/rejected-scripts/${rejectionId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to load rejected script."
          );
        }

        setScript(data);
      } catch (err) {
        console.error("Rejected script detail error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRejectedScript();
  }, [rejectionId]);

  if (loading) {
    return (
      <AdminLayout title="Review Rejected Script">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          Loading rejected script...
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Review Rejected Script">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          {error}
        </div>

        <button
          type="button"
          onClick={handleBack}
          className="mt-4 bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition"
        >
          <FaArrowLeft /> Back to Rejected Scripts
        </button>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Review Rejected Script">
      <div className="space-y-6">
        {/* Persistent Sticky Top Header Bar with Back Button */}
        <div className="sticky -top-8 z-30 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between gap-4 transition">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-gray-700 hover:text-blue-700 font-bold text-sm transition cursor-pointer"
          >
            <FaArrowLeft className="text-blue-600 text-base" />
            <span>Back to Rejected Scripts</span>
          </button>

          {script?.status && (
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                script.status === "PENDING_ADMIN_REVIEW"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : script.status === "RETURNED_TO_UPLOADER"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  script.status === "PENDING_ADMIN_REVIEW"
                    ? "bg-amber-500"
                    : script.status === "RETURNED_TO_UPLOADER"
                    ? "bg-emerald-500"
                    : "bg-blue-500"
                }`}
              ></span>
              {script.status === "PENDING_ADMIN_REVIEW"
                ? "Pending Review"
                : script.status === "RETURNED_TO_UPLOADER"
                ? "Returned to Uploader"
                : script.status === "RETURNED_TO_EXAMINER"
                ? "Returned to Examiner"
                : script.status}
            </span>
          )}
        </div>

        <ScriptDetailsCard script={script} />

        <PDFViewer script={script} />

        <ReviewActions
          rejectionId={rejectionId}
          script={script}
        />
      </div>
    </AdminLayout>
  );
}

export default RejectedScriptReview;