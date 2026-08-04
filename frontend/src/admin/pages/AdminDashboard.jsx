import { useEffect, useState } from "react";
import AdminLayout from "../../shared/layouts/AdminLayout";
import StatsCard from "../../shared/components/StatsCard";
import RejectedTable from "../../shared/components/RejectedTable";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function AdminDashboard() {
  const [scripts, setScripts] = useState([]);

  const [stats, setStats] = useState({
    rejected_today: 0,
    pending_review: 0,
    returned_to_uploader: 0,
    returned_to_examiner: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          throw new Error(
            "Authentication token not found. Please login again."
          );
        }

        const headers = {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        };

        // Fetch rejected scripts and dashboard statistics together
        const [scriptsResponse, statsResponse] = await Promise.all([
          fetch(
            `${API_URL}/api/v1/admin/rejected-scripts`,
            {
              method: "GET",
              headers,
            }
          ),

          fetch(
            `${API_URL}/api/v1/admin/dashboard/stats`,
            {
              method: "GET",
              headers,
            }
          ),
        ]);

        const scriptsData = await scriptsResponse.json();
        const statsData = await statsResponse.json();

        if (!scriptsResponse.ok) {
          throw new Error(
            scriptsData.detail ||
              "Failed to fetch rejected scripts."
          );
        }

        if (!statsResponse.ok) {
          throw new Error(
            statsData.detail ||
              "Failed to fetch dashboard statistics."
          );
        }

        setScripts(scriptsData);
        setStats(statsData);
      } catch (err) {
        console.error(
          "Dashboard data fetch error:",
          err
        );

        setError(
          err.message ||
            "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Dashboard Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard
            title="Rejected Today"
            value={loading ? "..." : stats.rejected_today}
          />
          <StatsCard
            title="Pending Review"
            value={loading ? "..." : stats.pending_review}
          />
          <StatsCard
            title="Returned to Uploader"
            value={loading ? "..." : stats.returned_to_uploader}
          />
          <StatsCard
            title="Returned to Examiner"
            value={loading ? "..." : stats.returned_to_examiner}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Rejected Scripts Table */}
        {!error && (
          <RejectedTable
            scripts={scripts}
            loading={loading}
          />
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;