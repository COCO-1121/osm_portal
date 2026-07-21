import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";
import ScriptDetailsCard from "../components/ScriptDetailsCard";
import PDFViewer from "../components/PDFViewer";
import ReviewActions from "../components/ReviewActions";

const API_URL = "http://127.0.0.1:8000";

function RejectedScriptReview() {
  const { rejectionId } = useParams();
  const navigate = useNavigate();

  const [script, setScript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          onClick={() => navigate("/admin/rejected-scripts")}
          className="mt-4 bg-blue-700 text-white px-5 py-2 rounded-lg"
        >
          Back to Rejected Scripts
        </button>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Review Rejected Script">
      <div className="space-y-6">
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