import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import RejectedTable from "../components/RejectedTable";

function RejectedScripts() {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRejectedScripts = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          throw new Error("Admin authentication token not found.");
        }

        const response = await fetch(
          "http://127.0.0.1:8000/api/v1/admin/rejected-scripts",
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

          throw new Error(
            errorData?.detail || "Failed to fetch rejected scripts."
          );
        }

        const data = await response.json();
        setScripts(data);
      } catch (err) {
        console.error("Rejected scripts fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRejectedScripts();
  }, []);

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Rejected Scripts
        </h1>

        <p className="text-gray-500 mt-2 mb-6">
          Review answer scripts rejected by examiners.
        </p>

        {loading && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            Loading rejected scripts...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
            {error}
          </div>
        )}

        {!loading && !error && (
          <RejectedTable scripts={scripts} />
        )}
      </div>
    </AdminLayout>
  );
}

export default RejectedScripts;